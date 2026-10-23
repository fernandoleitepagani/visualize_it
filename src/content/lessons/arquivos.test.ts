import { describe, expect, it } from 'vitest';
import { lessonArquivos } from './arquivos';

describe('lessonArquivos', () => {
  it('has correct metadata and configuration', () => {
    expect(lessonArquivos.id).toBe('arquivos');
    expect(lessonArquivos.view).toBe('file');
    expect(lessonArquivos.languages).toEqual(['c']);
    expect(lessonArquivos.inputless).toBe(true);
    expect(lessonArquivos.code.c).toBeDefined();
    expect(lessonArquivos.code.c?.length).toBeGreaterThan(0);
  });

  it('generates 14 sequential steps with valid lines in C code', () => {
    const steps = lessonArquivos.steps([1]);
    expect(steps.length).toBe(14);

    const cCode = lessonArquivos.code.c ?? [];
    expect(cCode.length).toBeGreaterThan(0);

    steps.forEach((step) => {
      expect(typeof step.desc).toBe('string');
      expect(step.desc.length).toBeGreaterThan(0);

      const lineIndex = typeof step.line === 'number' ? step.line : step.line.c;
      expect(lineIndex).toBeDefined();
      expect(lineIndex).toBeGreaterThanOrEqual(0);
      expect(lineIndex).toBeLessThan(cCode.length);
      expect(step.file).toBeDefined();
    });
  });

  it('correctly models stream lifecycle, seek head and stdout', () => {
    const steps = lessonArquivos.steps([1]);

    // Step 0: fopen "w"
    expect(steps[0].file?.ram.handle?.status).toBe('open');
    expect(steps[0].file?.ram.handle?.mode).toBe('w');
    expect(steps[0].file?.disk.cursorLine).toBe(1);
    expect(steps[0].file?.disk.lines).toHaveLength(0);

    // Step 2: fprintf "10\n"
    expect(steps[2].file?.disk.lines).toHaveLength(1);
    expect(steps[2].file?.disk.lines[0].text).toBe('10');
    expect(steps[2].file?.disk.cursorLine).toBe(2);

    // Step 3: fprintf "20\n"
    expect(steps[3].file?.disk.lines).toHaveLength(2);
    expect(steps[3].file?.disk.lines[1].text).toBe('20');
    expect(steps[3].file?.disk.cursorLine).toBe(3);

    // Step 4: fclose
    expect(steps[4].file?.ram.handle?.status).toBe('closed');
    expect(steps[4].file?.ram.flushing).toBe(true);
    expect(steps[4].file?.disk.cursorLine).toBeNull();

    // Step 5: fopen "r"
    expect(steps[5].file?.ram.handle?.status).toBe('open');
    expect(steps[5].file?.ram.handle?.mode).toBe('r');
    expect(steps[5].file?.disk.cursorLine).toBe(1);

    // Step 6: int x
    const varX = steps[6].file?.ram.variables?.find((v) => v.name === 'x');
    expect(varX).toBeDefined();

    // Step 7: fscanf 10
    expect(steps[7].file?.ram.variables?.find((v) => v.name === 'x')?.value).toBe(10);
    expect(steps[7].file?.disk.cursorLine).toBe(2);

    // Step 8: printf 10
    expect(steps[8].file?.stdout).toEqual(['10']);

    // Step 9: fscanf 20
    expect(steps[9].file?.ram.variables?.find((v) => v.name === 'x')?.value).toBe(20);
    expect(steps[9].file?.disk.cursorLine).toBe(3);
    expect(steps[9].file?.disk.eofReached).toBe(true);

    // Step 10: printf 20
    expect(steps[10].file?.stdout).toEqual(['10', '20']);

    // Step 11: fscanf EOF
    expect(steps[11].vars?.['fscanf retorno']).toBe('EOF (-1)');

    // Step 12: fclose
    expect(steps[12].file?.ram.handle?.status).toBe('closed');

    // Step 13: return 0
    expect(steps[13].vars?.['código de retorno']).toBe(0);
  });
});
