'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { criarServicos } from '@/dados/servicos';
import estilos from './admin.module.css';
import { CampoTexto } from './campos';

export function Login() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  // Quem já entrou não precisa ver o login de novo.
  useEffect(() => {
    if (criarServicos().autenticacao.sessaoAtiva()) router.replace('/admin/textos');
  }, [router]);

  return (
    <main className={estilos.login}>
      <form
        className={estilos.loginCaixa}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setEntrando(true);
          void criarServicos()
            .autenticacao.entrar(usuario, senha)
            .then((ok) => {
              if (ok) {
                router.replace('/admin/textos');
              } else {
                setErro('Usuário ou senha incorretos.');
                setEntrando(false);
              }
            });
        }}
      >
        <h1 className={estilos.titulo}>Painel do fotógrafo</h1>
        <p className={estilos.secaoIntro} style={{ margin: 0 }}>
          Onde o Andrei edita os textos, os álbuns, as fotos e a agenda do site.
        </p>

        <div className={estilos.credencial}>
          Nesta demonstração o acesso é <code>admin</code> / <code>admin</code>. O login não protege
          nada: serve para mostrar o fluxo.
        </div>

        {erro && (
          <div className={estilos.avisoErro} role="alert">
            {erro}
          </div>
        )}

        <CampoTexto rotulo="Usuário" valor={usuario} aoMudar={setUsuario} autoComplete="username" />
        <CampoTexto
          rotulo="Senha"
          tipo="password"
          valor={senha}
          aoMudar={setSenha}
          autoComplete="current-password"
        />

        <button type="submit" className={estilos.botao} disabled={entrando}>
          Entrar
        </button>
      </form>
    </main>
  );
}
