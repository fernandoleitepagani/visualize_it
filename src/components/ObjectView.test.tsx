import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ObjectState } from '@/engine/types';
import { renderWithProviders } from '@/test/render';
import { ObjectView } from './ObjectView';

describe('ObjectView', () => {
  it('renders empty fallback when state is undefined or empty', () => {
    renderWithProviders(<ObjectView />);
    expect(screen.getByText('Nenhum objeto em memória')).toBeInTheDocument();
  });

  it('renders class blueprints with attributes and methods', () => {
    const state: ObjectState = {
      blueprints: [
        {
          name: 'Aluno',
          attributes: [
            { name: 'nome', type: 'string', visibility: 'private' },
            { name: 'matricula', type: 'int', visibility: 'private' },
          ],
          methods: [
            { name: 'setNome', params: 'string n', returnType: 'void', visibility: 'public' },
            { name: 'getNome', params: '', returnType: 'string', visibility: 'public' },
          ],
        },
      ],
    };

    renderWithProviders(<ObjectView state={state} />);

    expect(screen.getByText('class Aluno')).toBeInTheDocument();
    expect(screen.getByText('nome')).toBeInTheDocument();
    expect(screen.getByText('matricula')).toBeInTheDocument();
    expect(screen.getByText('setNome(string n)')).toBeInTheDocument();
    expect(screen.getByText('getNome()')).toBeInTheDocument();
  });

  it('renders object instances with internal state and highlights written fields', () => {
    const state: ObjectState = {
      instances: [
        {
          id: 'a',
          label: 'Aluno a',
          className: 'Aluno',
          state: 'write',
          attributes: [
            { name: 'nome', value: 'Ana', visibility: 'private', state: 'write' },
            { name: 'matricula', value: 202601, visibility: 'private' },
          ],
        },
      ],
    };

    renderWithProviders(<ObjectView state={state} />);

    expect(screen.getByText('Aluno a')).toBeInTheDocument();
    expect(screen.getByText('instância : Aluno')).toBeInTheDocument();
    expect(screen.getByText('"Ana"')).toBeInTheDocument();
    expect(screen.getByText('202601')).toBeInTheDocument();
    expect(screen.getByText('gravado')).toBeInTheDocument();
  });

  it('renders active method execution call banner', () => {
    const state: ObjectState = {
      call: {
        caller: 'main()',
        target: 'a.setNome("Ana")',
        dispatchedTo: 'Aluno::setNome',
        params: { n: 'Ana' },
      },
    };

    renderWithProviders(<ObjectView state={state} />);

    expect(screen.getByText('executando método')).toBeInTheDocument();
    expect(screen.getByText('a.setNome("Ana")')).toBeInTheDocument();
    expect(screen.getByText('➔ Aluno::setNome')).toBeInTheDocument();
    expect(screen.getByText('n = "Ana"')).toBeInTheDocument();
  });

  it('renders pointer and dynamic polymorphic dispatch', () => {
    const state: ObjectState = {
      pointer: {
        name: 'Animal* a',
        type: 'Animal*',
        targetId: 'c',
        targetLabel: '&c (Cachorro)',
      },
    };

    renderWithProviders(<ObjectView state={state} />);

    expect(screen.getByText('ponteiro base')).toBeInTheDocument();
    expect(screen.getByText('Animal* a')).toBeInTheDocument();
    expect(screen.getByText('&c (Cachorro)')).toBeInTheDocument();
  });

  it('renders exception handling flow with try, throw, and catch', () => {
    const state: ObjectState = {
      exception: {
        stage: 'throw',
        errorType: 'runtime_error',
        message: 'divisao por zero',
        bypassed: true,
      },
    };

    renderWithProviders(<ObjectView state={state} />);

    expect(screen.getByText('Fluxo de Tratamento de Exceções')).toBeInTheDocument();
    expect(screen.getByText('runtime_error')).toBeInTheDocument();
    expect(screen.getByText('"divisao por zero"')).toBeInTheDocument();
    expect(screen.getByText('fluxo normal do try cancelado')).toBeInTheDocument();
    expect(screen.getByText('throw')).toBeInTheDocument();
  });
});
