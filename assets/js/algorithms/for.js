viz.register('for', {
    title: 'For',
    subtitle: 'Somatório com laço aninhado',
    description:
        'Calcula o valor de S. ' +
        'Exemplo real de codigo que já apareceu em prova: dois laços aninhados, e o interno depende do externo. ' +
        'O primeiro valor informado é usado como N (1 a 10).',
    view: 'cells',
    panelLabel: 'variáveis',
    initial: [3],

    complexity: {
        time: { best: 'Θ(N²)', avg: 'Θ(N²)', worst: 'Θ(N²)' },
        space: 'Θ(1)',
        stable: undefined,            // não se aplica a um somatório
        note:
        'O laço externo executa N vezes; o interno, N − i vezes. ' +
        'Total ≈ N²/2 iterações → Θ(N²) em qualquer caso. ' +
        'Espaço constante: apenas S, num, i e p.'
    },

    code: {
    java: `
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        float S = 0, num;
        int N;

        System.out.print("N: ");
        N = sc.nextInt();

        for (int i = 1; i <= N-1; i++) {
            num = 0;
            for (int p = i + 1; p <= N; p++) {
                num += i * p;
            }
            S += num / (3 * i - 1);
        }
        System.out.println("resultado: " + S);
    }
}`.trim().split('\n'),

    c: `
int main() {
    float S = 0, num;
    int N;

    printf("N: ");
    scanf("%d", &N);

    for (int i = 1; i <= N; i++) {
        num = 0;
        for (int p = i + 1; p <= N-1; p++) {
            num += i * p;
        }
        S += num / (3 * i - 1);
    }
    printf("resultado: %f", S);
    return 0;
}`.trim().split('\n')
    },

    steps(initial) {
        const raw = Number(initial[0]);
        const N = Number.isFinite(raw) && raw >= 1 ? Math.min(10, Math.floor(raw)) : 6;

        const out = [];
        let S = 0;
        let i = '—', p = '—', num = '—';

        const fmt = (x) => {
        if (typeof x !== 'number' || !Number.isFinite(x)) return '—';
        return String(Math.round(x * 1000) / 1000);
        };

        const snap = (desc, line, hl = {}) => {
        out.push({
            line,
            desc,
            cells: [
            { val: N,      labels: ['N'],   state: hl.N   || '' },
            { val: i,      labels: ['i'],   state: hl.i   || '' },
            { val: p,      labels: ['p'],   state: hl.p   || '' },
            { val: num,    labels: ['num'], state: hl.num || '' },
            { val: fmt(S), labels: ['S'],   state: hl.S   || '' }
            ]
        });
    };

    // linha 5  (C) / 5 (Java):  float S = 0, num;
    snap('Declarar S = 0 e num.', 5, { S: 'write' });

    // linha 8: printf / System.out.print
    snap('Ler N.', 8);

    // linha 9: scanf / nextInt
    snap(`N = ${N}.`, 9, { N: 'active' });

    for (let ii = 1; ii <= N; ii++) {
        i = ii;

        // linha 11: for (int i = 1; i <= N; i++)
        snap(`i = ${i} — início do laço externo.`, 11, { i: 'active' });

        // linha 12: num = 0;
        num = 0;
        snap('num = 0.', 12, { num: 'write' });

        if (ii + 1 > N-1) {
            // linha 13: condição do for interno já falha
            snap(`p = ${ii + 1} > N — laço interno não executa.`, 13, { i: 'active' });
        } else {
            for (let pp = ii + 1; pp <= N-1; pp++) {
            p = pp;
            // linha 13: for (int p = i+1; p <= N; p++)
            snap(`p = ${p}.`, 13, { p: 'active' });

            // linha 14: num += i * p;
            num += ii * pp;
            snap(`num += ${ii} · ${pp} = ${ii * pp} → num = ${num}.`, 14, { num: 'write' });
            }
            p = '—';
            // linha 15: } do for interno
            snap(`Fim do laço interno (p chegou a ${N + 1} > N).`, 15);
        }

        // linha 16: S += num / (3*i - 1);
        const denom   = 3 * ii - 1;
        const parcela = num / denom;
        S += parcela;
        snap(
            `S += ${num} / (3·${ii} − 1) = ${num}/${denom} ≈ ${parcela.toFixed(3)} → S = ${fmt(S)}.`,
            16, { S: 'write' }
        );
        }

        // linha 18: printf / println do resultado
        snap(`Fim. Resultado: S = ${fmt(S)}.`, 18, { S: 'active' });

        return out;
    }
});