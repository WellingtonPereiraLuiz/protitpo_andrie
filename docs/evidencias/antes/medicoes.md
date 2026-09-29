# Medições do "antes" — protótipo original (index.html, 12.738.789 bytes)

Servido com `python3 -m http.server 8099` na raiz do repositório, na revisão `a8c2cee`.
Coletado com Playwright + Chromium (chrome-headless-shell 153.0.8010.12), cache limpo a cada
execução, 5 execuções por cenário, valor reportado = mediana.

Critério de "carregado": evento `load` + o seletor `text=Chego cedo` visível
(primeiro texto da home que só existe depois de o bundler trocar o documento).

| Cenário                                   | Execuções (ms)                     | Mediana  |
|-------------------------------------------|------------------------------------|----------|
| localhost, sem throttle                   | 625, 633, 645, 654, 657            | 645 ms   |
| 10 Mbps / 40 ms RTT / CPU 4x mais lenta   | 11552, 11559, 11593, 11621, 11636  | 11593 ms |

Transferência da navegação: 12.739.089 bytes (um único documento HTML).

Observação: os 5,3 s relatados pelo cliente ficam entre os dois cenários — coerente com
uma máquina/rede reais. O número de localhost sem throttle NÃO representa a experiência
do usuário final; a comparação do "depois" usará exatamente os mesmos dois cenários.

## Capturas
- `390x844.png` / `1440x900.png` — primeira coisa que aparece (modal de onboarding do protótipo)
- `390x844-sem-modal.png` / `1440x900-sem-modal.png` — modal dispensado, site à mostra
- `*-fullpage.png` — página inteira
