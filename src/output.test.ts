import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as output from './output';
import fs from 'fs-extra';
// @ts-ignore
import path from 'path';

// Mock fs-extra
vi.mock('fs-extra', () => {
    return {
        default: {
            ensureDir: vi.fn(),
            writeJSON: vi.fn(),
            writeFile: vi.fn(),
            pathExists: vi.fn(),
            readFile: vi.fn(),
            copy: vi.fn(),
        }
    };
});

describe('output module', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateMarkdown', () => {
        it('should generate markdown with categorized sections', () => {
            const techs = [
                { name: 'TypeScript', type: 'language', logo: 'ts.svg', slug: 'typescript' },
                { name: 'React', type: 'frontend', logo: 'react.svg', slug: 'react' },
                { name: 'Unknown', type: 'custom', logo: 'u.svg', slug: 'u' }
            ];

            const md = output.generateMarkdown(techs as any);
            
            expect(md).toContain('# Tech Stack');
            expect(md).toContain('## Language');
            expect(md).toContain('**TypeScript**');
            expect(md).toContain('## Frontend');
            expect(md).toContain('**React**');
            expect(md).toContain('## Custom');
            expect(md).toContain('**Unknown**');
        });

        it('should include images when assetsPath is provided and logo is available', () => {
            const techs = [
                { name: 'TypeScript', type: 'language', logo: 'ts.svg', slug: 'typescript' }
            ];
            const availableLogos = new Set(['ts.svg']);
            const md = output.generateMarkdown(techs as any, './assets', availableLogos);

            expect(md).toContain('<img src="./assets/ts.svg"');
        });

        it('should handle http logos correctly', () => {
             const techs = [
                { name: 'Remote', type: 'language', logo: 'https://example.com/logo.svg', slug: 'remote' }
            ];
            const md = output.generateMarkdown(techs as any);
            expect(md).toContain('<img src="https://example.com/logo.svg"');
        });
    });


    describe('writeOutput', () => {
        it('should write JSON output by default', async () => {
             const techs = [{ name: 'Test', type: 'misc', logo: 'test.svg', slug: 't' }];
             const outPath = 'out.json';
             (fs.writeJSON as any).mockResolvedValue(undefined);
             
             await output.writeOutput(outPath, techs as any, {}, 'json');
             
             expect(fs.writeJSON).toHaveBeenCalledWith(outPath, expect.anything(), expect.anything());
        });

        it('should write Markdown output and handle assets', async () => {
             const techs = [{ name: 'Test', type: 'misc', logo: 'test.svg', slug: 't' }];
             const outPath = 'out.json'; // Should be converted to .md
             const assetsPath = 'public/assets';
             
             // Mock copyAssets internal behavior via fs logic
             (fs.pathExists as any).mockResolvedValue(true);
             (fs.readFile as any).mockResolvedValue('<svg></svg>');
             (fs.writeFile as any).mockResolvedValue(undefined);
             
             await output.writeOutput(outPath, techs as any, {}, 'markdown', assetsPath);
             
             // Check if md file was written
             expect(fs.writeFile).toHaveBeenCalledWith('out.md', expect.stringContaining('# Tech Stack'));
             // Check if copyAssets logic was triggered (fs.readFile on svg)
             expect(fs.readFile).toHaveBeenCalled();
        });
    });

    describe('copyAssets', () => {
        it('should copy existing assets', async () => {
             const techs = [
                 { name: 'Test', type: 'misc', logo: 'test.svg', slug: 't' }
             ];
             const dest = 'public/assets';
             const config = { colorMode: 'brand' as const };
             
             // Mock asset exists
             (fs.pathExists as any).mockResolvedValue(true);
             (fs.readFile as any).mockResolvedValue('<svg></svg>');
             
             const copied = await output.copyAssets(techs as any, dest, config);
             
             expect(fs.readFile).toHaveBeenCalled();
             expect(fs.writeFile).toHaveBeenCalled();
             expect(copied.has('test.svg')).toBe(true);
        });

        it('should apply color to svg (white)', async () => {
             const techs = [
                 { name: 'Test', type: 'misc', logo: 'test.svg', slug: 't' }
             ];
             const dest = 'public/assets';
             const config = { colorMode: 'white' as const }; 
             
             (fs.pathExists as any).mockResolvedValue(true);
             (fs.readFile as any).mockResolvedValue('<svg fill="#000"></svg>');
             
             await output.copyAssets(techs as any, dest, config);
             
             expect(fs.writeFile).toHaveBeenCalledWith(
                 expect.any(String),
                 expect.stringContaining('fill="#FFFFFF"'), 
             );
        });

        it('should apply color to svg (black)', async () => {
             const techs = [{ name: 'Test', type: 'misc', logo: 'test.svg', slug: 't' }];
             const dest = 'public/assets';
             const config = { colorMode: 'black' as const }; 
             
             (fs.pathExists as any).mockResolvedValue(true);
             (fs.readFile as any).mockResolvedValue('<svg fill="#FFF"></svg>');
             
             await output.copyAssets(techs as any, dest, config);
             
             expect(fs.writeFile).toHaveBeenCalledWith(
                 expect.any(String),
                 expect.stringContaining('fill="#000000"'), 
             );
        });

        it('should apply custom hex color', async () => {
             const techs = [{ name: 'Test', type: 'misc', logo: 'test.svg', slug: 't' }];
             const dest = 'public/assets';
             const config = { colorMode: 'custom' as const, customColor: '#123456' }; 
             
             (fs.pathExists as any).mockResolvedValue(true);
             (fs.readFile as any).mockResolvedValue('<svg fill="#000"></svg>');
             
             await output.copyAssets(techs as any, dest, config);
             
             expect(fs.writeFile).toHaveBeenCalledWith(
                 expect.any(String),
                 expect.stringContaining('fill="#123456"'), 
             );
        });

        it('should fallback to default icon if logo missing', async () => {
             const techs = [{ name: 'Test', type: 'auth', logo: 'missing.svg', slug: 't' }];
             const dest = 'public/assets';
             
             // Mock missing custom logo, but existing lucide logo
             (fs.pathExists as any).mockImplementation(async (p: string) => {
                 if (p.includes('missing.svg')) return false;
                 // auth maps to 'lock' icon in defaults
                 if (p.includes('lock.svg')) return true; 
                 return false;
             });
             
             (fs.readFile as any).mockResolvedValue('<svg stroke="currentColor"></svg>');
             
             const copied = await output.copyAssets(techs as any, dest, { colorMode: 'white' });
             
             // Should have copied default logo
             // The implementation modifies the tech object's logo property to defaults/lock.svg
             expect(fs.writeFile).toHaveBeenCalledWith(
                 expect.stringContaining('lock.svg'),
                 expect.stringContaining('stroke="#FFFFFF"') // Lucide uses stroke
             );
        });
    });

});
