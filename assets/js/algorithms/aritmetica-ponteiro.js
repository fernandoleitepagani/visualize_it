viz.register('aritmetica', {
    title: 'Aritmética de ponteiros',
    subtitle: 'Percorrendo um vetor com um ponteiro p',
    description:
        'Demonstra como um ponteiro p caminha pelo vetor usando operações de ' +
        'aritmética de ponteiros: p = v, p++, p += 2 e p--. A cada passo, a seta ▼ ' +
        'indica a posição atual de p e *p mostra o valor lido.',
    view: 'cells',
    panelLabel: 'vetor',
    initial: [10, 20, 30, 40, 50],

    complexity: {
        time: { best: 'Θ(1)', avg: 'Θ(1)', worst: 'Θ(1)' },
        space: 'Θ(1)', stable: true,
        note: 'Cada operação de aritmética de ponteiros (p++, p--, p += k) é Θ(1).'
    },

    code: {
        java: `
    void walk() {
        int[] v = {10, 20, 30, 40, 50};
        int p = 0;                  // p aponta v[0]

        System.out.println(v[p]);   // 10
        p++;                        // p = 1
        System.out.println(v[p]);   // 20
        p += 2;                     // p = 3
        System.out.println(v[p]);   // 40
        p--;                        // p = 2
        System.out.println(v[p]);   // 30
    }`.trim().split('\n'),

        c: `
    void walk() {
        int v[] = {10, 20, 30, 40, 50};
        int *p = v;              /* p → v[0] */

        printf("%d\\n", *p);      /* 10 */
        p++;                     /* p → v[1] */
        printf("%d\\n", *p);      /* 20 */
        p += 2;                  /* p → v[3] */
        printf("%d\\n", *p);      /* 40 */
        p--;                     /* p → v[2] */
        printf("%d\\n", *p);      /* 30 */
    }`.trim().split('\n')
    },

    steps(initial) {
        // Garante 5 posições (o roteiro usa índices fixos 0..4)
        const v = [0, 1, 2, 3, 4].map(i =>
        Number.isFinite(initial[i]) ? initial[i] : (i + 1) * 10
        );
        const out = [];

        const snap = (desc, line, pPos) => {
        out.push({
            line,
            desc,
            cells: v.map((val, i) => ({
            val,
            labels: i === pPos ? ['▼ p'] : [],
            state: i === pPos ? 'active' : ''
            }))
        });
        };

        snap(`Vetor com ${v.length} elementos.`, 1, -1);
        snap(`p = v  →  p aponta para v[0] = ${v[0]}.`, 2, 0);
        snap(`*p  →  lê v[0] = ${v[0]}.`, 4, 0);
        snap(`p++  →  p passa a apontar para v[1] = ${v[1]}.`, 5, 1);
        snap(`*p  →  lê v[1] = ${v[1]}.`, 6, 1);
        snap(`p += 2  →  p passa a apontar para v[3] = ${v[3]}.`, 7, 3);
        snap(`*p  →  lê v[3] = ${v[3]}.`, 8, 3);
        snap(`p--  →  p passa a apontar para v[2] = ${v[2]}.`, 9, 2);
        snap(`*p  →  lê v[2] = ${v[2]}.`, 10, 2);

        return out;
    }
});