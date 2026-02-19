import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as scanModule from './scan';
import fs from 'fs';
import path from 'path';

// Mock fs module
vi.mock('fs', () => {
    return {
        default: {
            existsSync: vi.fn(),
            readFileSync: vi.fn(),
            readdirSync: vi.fn(),
            mkdirSync: vi.fn(),
            writeFileSync: vi.fn(),
            renameSync: vi.fn(),
            statSync: vi.fn(),
        }
    };
});

// Mock output module
vi.mock('./output', () => ({
    generateMarkdown: vi.fn(() => 'mock markdown'),
    copyAssets: vi.fn(() => Promise.resolve(new Set())),
}));

describe('scan module', () => {
    let mockExit: any;
    let consoleLogSpy: any;
    let consoleWarnSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock default behaviors
        (fs.existsSync as any).mockReturnValue(true); 
        (fs.statSync as any).mockReturnValue({ isFile: () => true });

        mockExit = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
             throw new Error(`process.exit(${code})`);
        });
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        mockExit.mockRestore();
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    it('should scan single project and generate output', async () => {
        const pkgJson = JSON.stringify({
            dependencies: {
                'react': '18.0.0',
                'typescript': '5.0.0'
            },
            devDependencies: {
                'vitest': '1.0.0'
            }
        });
        
        (fs.readFileSync as any).mockImplementation((p: string) => {
             if (p.endsWith('package.json')) return pkgJson;
             return '';
        });

        await scanModule.scan('my-project', { out: 'out.json' });

        expect(fs.writeFileSync).toHaveBeenCalled();
        const calls = (fs.writeFileSync as any).mock.calls;
        const outCall = calls.find((c: any) => c[0] === path.resolve('out.json'));
        
        expect(outCall).toBeDefined();
        const output = JSON.parse(outCall[1]);
        const slugs = output.map((t: any) => t.slug);
        
        expect(slugs).toContain('react');
        expect(slugs).toContain('typescript');
        expect(slugs).toContain('vitest');
    });

    it('should skip SKIPPED_TECHS (react-dom)', async () => {
        const pkgJson = JSON.stringify({
            dependencies: {
                'react': '18.0.0',
                'react-dom': '18.0.0'
            }
        });
        // Override mock
        (fs.readFileSync as any).mockReturnValue(pkgJson);

        await scanModule.scan('my-project', { out: 'out.json' });

        const calls = (fs.writeFileSync as any).mock.calls;
        const outCall = calls.find((c: any) => c[0] === path.resolve('out.json'));
        
        const output = JSON.parse(outCall[1]);
        const slugs = output.map((t: any) => t.slug);
        
        expect(slugs).toContain('react');
        expect(slugs).not.toContain('react-dom'); 
    });

    it('should fail gracefully if package.json is missing', async () => {
        (fs.existsSync as any).mockReturnValue(false); 
        
        await expect(scanModule.scan('test-path')).rejects.toThrow('process.exit(1)');
    });

    describe('workspace mode', () => {
        beforeEach(() => {
            // Mock BASE_DIR existence
            (fs.existsSync as any).mockImplementation((p: string) => {
                if (p.endsWith('stackscan')) return true;
                if (p.endsWith('package.json')) return true;
                if (p.endsWith('README.md')) return true;
                return true;
            });
            
            // Mock readdirSync to return project folders
            (fs.readdirSync as any).mockImplementation((p: string) => {
                // Return projects only when reading the root stackscan folder
                // Just assuming any dir read is potentially the root for simpler mock
                return [
                    { name: 'project-a', isDirectory: () => true },
                    { name: 'project-b', isDirectory: () => true },
                    { name: 'input', isDirectory: () => true }, // Should be ignored
                ];
            });

            (fs.statSync as any).mockReturnValue({ isFile: () => true });
            
            // Default readFileSync for normal tests (mocks empty package.json)
            (fs.readFileSync as any).mockReturnValue('{}');
        });

        it('should scan all projects in workspace', async () => {
            await scanModule.scan();
            
            // We expect writes to stack.json in each project folder
            expect(fs.writeFileSync).toHaveBeenCalled();
            const calls = (fs.writeFileSync as any).mock.calls;
            
            const projectACall = calls.find((c: any) => c[0].includes('project-a') && c[0].endsWith('stack.json'));
            const projectBCall = calls.find((c: any) => c[0].includes('project-b') && c[0].endsWith('stack.json'));
            
            expect(projectACall).toBeDefined();
            expect(projectBCall).toBeDefined();
        });

        it('should update root README if enabled', async () => {
             // Mock specific read behaviors
             (fs.readFileSync as any).mockImplementation((p: string) => {
                 if (typeof p === 'string' && p.endsWith('README.md')) {
                     return '# My README\n<!-- STACKSCAN_START -->OLD CONTENT<!-- STACKSCAN_END -->';
                 }
                 if (typeof p === 'string' && p.endsWith('package.json')) {
                     return JSON.stringify({ name: 'sub-project', dependencies: {} });
                 }
                 return '{}';
             });
             
             await scanModule.scan({ readme: true });
             
             const calls = (fs.writeFileSync as any).mock.calls;
             const readmeCall = calls.find((c: any) => c[0].endsWith('README.md'));
             expect(readmeCall).toBeDefined();

             // Should replace content between markers
             expect(readmeCall[1]).toContain('<!-- STACKSCAN_START -->');
             expect(readmeCall[1]).toContain('<!-- STACKSCAN_END -->');
        });

        it('should create stackscan directory if it does not exist', async () => {
             // Mock statckscan dir not existing
             (fs.existsSync as any).mockImplementation((p: string) => {
                 if (p.endsWith('stackscan')) return false;
                 return true;
             });

             await expect(scanModule.scan()).rejects.toThrow('process.exit(0)');
             
             expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('stackscan'), expect.anything());
        });

        it('should warn if no projects found', async () => {
             (fs.readdirSync as any).mockReturnValue([]);
             
             await scanModule.scan();
             
             expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No project directories found'));
        });
    });

    describe('argument handling', () => {
        it('should handle options object as first argument', async () => {
             // Mock workspace setup - no projects found so it returns early or skips loop
             // But we want to test readme flag which is checked AFTER loop (if projects exist)
             // or check if it entered workspace mode.
             
             // Let's create a scenario with projects
             (fs.readdirSync as any).mockReturnValue([
                 { name: 'project-a', isDirectory: () => true }
             ]);
             (fs.existsSync as any).mockReturnValue(true);
             (fs.readFileSync as any).mockImplementation((p: string) => {
                 if (p.endsWith('package.json')) return '{}';
                 return '';
             });
             
             const options = { readme: false };
             await scanModule.scan(options as any);
             
             expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping README update'));
        });
    });

});
