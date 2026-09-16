from pathlib import Path

readme = """# 🎓 Humand Course Helper

Userscript para auxiliar na navegação de cursos na plataforma **Humand**, automatizando tarefas repetitivas durante materiais de leitura e vídeos.

## ✨ Recursos

- 🎬 Detecta automaticamente aulas em vídeo.
- ⚡ Aumenta a velocidade de reprodução do vídeo para a maior velocidade aceita pelo navegador/player, tentando até **16×**.
- ▶️ Tenta iniciar automaticamente a reprodução do vídeo.
- ⏱️ Exibe no painel o tempo atual, duração e velocidade de reprodução.
- 📄 Percorre automaticamente materiais de leitura com área rolável.
- ✅ Detecta quando **Finalizar lição** está disponível.
- ➡️ Avança automaticamente para a próxima lição após a conclusão.
- 📝 Detecta avaliações/questionários e pausa a automação para que sejam respondidos pelo usuário.
- 🎛️ Possui painel flutuante com botão **INICIAR / PARAR** e status em tempo real.

## 📋 Requisitos

- Google Chrome, Microsoft Edge ou outro navegador compatível com userscripts.
- Extensão **Tampermonkey** instalada.
- Acesso à plataforma Humand.

## 🚀 Instalação

1. Instale a extensão **Tampermonkey** no navegador.
2. Abra o painel do Tampermonkey.
3. Clique em **Adicionar novo script**.
4. Apague o conteúdo padrão do editor.
5. Copie o conteúdo do arquivo `humand-course-helper.user.js`.
6. Cole no editor do Tampermonkey.
7. Salve com `Ctrl + S`.
8. Abra ou recarregue o Humand com `Ctrl + F5`.

O painel **🎓 Humand — Auxiliar V5** aparecerá no canto inferior direito da página.

## 🖥️ Como usar

Abra normalmente um curso no Humand e clique em:

**▶ INICIAR**

O comportamento depende do tipo de lição:

### 🎬 Vídeos

O script detecta o elemento de vídeo, tenta iniciar a reprodução e configura a maior velocidade aceita entre:

`16× → 8× → 4× → 3× → 2×`

O painel mostra o progresso, por exemplo:

```text
🎬 Vídeo: 1:20 / 6:52 • 16×
