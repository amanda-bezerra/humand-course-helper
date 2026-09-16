script = r'''// ==UserScript==
// @name         Humand - Auxiliar de Cursos V5
// @namespace    amanda-humand
// @version      5.0
// @description  Auxilia leitura, vídeos acelerados e avanço das lições no Humand
// @match        https://app.humand.co/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let ativo = false;
    let ultimoClique = 0;
    let ultimaRolagem = 0;

    const INTERVALO = 1000;
    const TEMPO_ENTRE_CLIQUES = 3500;
    const TEMPO_ENTRE_ROLAGENS = 900;
    const VELOCIDADE_DESEJADA = 16;

    console.log('[HUMAND V5] Script carregado.');

    function texto(el) {
        return (el?.innerText || el?.textContent || '').trim().toLowerCase();
    }

    function visivel(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 &&
            style.display !== 'none' && style.visibility !== 'hidden';
    }

    function habilitado(el) {
        if (!el || el.disabled) return false;
        if (el.getAttribute('aria-disabled') === 'true') return false;
        return true;
    }

    function criarPainel() {
        if (!document.body || document.getElementById('humand-auxiliar-v5')) return;

        const painel = document.createElement('div');
        painel.id = 'humand-auxiliar-v5';
        painel.style.cssText = `
            position:fixed!important;right:14px!important;bottom:14px!important;
            z-index:2147483647!important;width:290px!important;padding:14px!important;
            background:#181818!important;color:white!important;
            border:1px solid #5865f2!important;border-radius:12px!important;
            box-shadow:0 6px 25px rgba(0,0,0,.65)!important;
            font-family:Arial,sans-serif!important;font-size:13px!important;
        `;

        painel.innerHTML = `
            <div style="font-size:15px;font-weight:bold;margin-bottom:10px">
                🎓 Humand — Auxiliar V5
            </div>
            <div id="humand-status-v5"
                 style="min-height:38px;margin-bottom:10px;line-height:18px">
                🔴 Desativado
            </div>
            <button id="humand-toggle-v5"
                    style="width:100%;padding:10px;border:0;border-radius:7px;
                           cursor:pointer;font-weight:bold">
                ▶ INICIAR
            </button>
        `;

        document.body.appendChild(painel);

        const botao = document.getElementById('humand-toggle-v5');
        botao.addEventListener('click', () => {
            ativo = !ativo;
            if (ativo) {
                botao.textContent = '■ PARAR';
                atualizarStatus('🟢 Auxiliar iniciado...');
            } else {
                botao.textContent = '▶ INICIAR';
                atualizarStatus('🔴 Desativado');
            }
        });
    }

    function atualizarStatus(mensagem) {
        const status = document.getElementById('humand-status-v5');
        if (status) status.textContent = mensagem;
    }

    function encontrarBotao(nomes) {
        const elementos = document.querySelectorAll('button, a, [role="button"]');
        for (const el of elementos) {
            if (!visivel(el)) continue;
            const t = texto(el);
            for (const nome of nomes) {
                if (t === nome || t.includes(nome)) return el;
            }
        }
        return null;
    }

    function clicar(el) {
        if (!el || !habilitado(el)) return false;

        const agora = Date.now();
        if (agora - ultimoClique < TEMPO_ENTRE_CLIQUES) return false;
        ultimoClique = agora;

        try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {}

        setTimeout(() => {
            try {
                el.click();
            } catch (e) {
                console.log('[HUMAND V5] Erro no clique:', e);
            }
        }, 400);

        return true;
    }

    function encontrarVideo() {
        return [...document.querySelectorAll('video')].find(visivel) || null;
    }

    function formatarTempo(segundos) {
        if (!Number.isFinite(segundos)) return '--:--';
        segundos = Math.floor(segundos);
        const minutos = Math.floor(segundos / 60);
        const resto = segundos % 60;
        return minutos + ':' + String(resto).padStart(2, '0');
    }

    function aplicarVelocidade(video) {
        const velocidades = [VELOCIDADE_DESEJADA, 8, 4, 3, 2];

        for (const velocidade of velocidades) {
            try {
                video.playbackRate = velocidade;
                video.defaultPlaybackRate = velocidade;

                if (Math.abs(video.playbackRate - velocidade) < 0.01) {
                    return video.playbackRate;
                }
            } catch (e) {}
        }

        return video.playbackRate || 1;
    }

    function processarVideo(video) {
        if (!video) return false;

        const velocidade = aplicarVelocidade(video);

        if (!video.ended) {
            const atual = video.currentTime || 0;
            const total = video.duration;

            atualizarStatus(
                '🎬 Vídeo: ' + formatarTempo(atual) +
                ' / ' + formatarTempo(total) +
                ' • ' + velocidade + '×'
            );

            if (video.paused) {
                video.play().catch(() => {
                    atualizarStatus(
                        '▶ Clique em Play uma vez. Velocidade: ' +
                        velocidade + '×'
                    );
                });
            }

            return true;
        }

        atualizarStatus('✅ Vídeo concluído. Finalizando lição...');
        return false;
    }

    function detectarAvaliacaoAtual() {
        const radios = [...document.querySelectorAll('input[type="radio"]')].filter(visivel);
        const checks = [...document.querySelectorAll('input[type="checkbox"]')].filter(visivel);

        if (radios.length >= 2 || checks.length >= 2) return true;

        const main = document.querySelector('main');
        if (main) {
            const t = texto(main);
            if (t.includes('quantidade de perguntas') && t.includes('nota mínima')) {
                return true;
            }
        }

        return false;
    }

    function encontrarContainersRolaveis() {
        const resultado = [];
        const elementos = document.querySelectorAll('div, section, main, article');

        for (const el of elementos) {
            if (!visivel(el)) continue;

            const style = getComputedStyle(el);
            const temRolagem = el.scrollHeight > el.clientHeight + 80;
            const overflow =
                style.overflowY === 'auto' ||
                style.overflowY === 'scroll';

            if (temRolagem && overflow) resultado.push(el);
        }

        return resultado;
    }

    function escolherAreaLeitura() {
        const candidatos = encontrarContainersRolaveis();
        if (!candidatos.length) return null;

        const grandes = candidatos.filter(
            el => el.clientWidth > 400 && el.clientHeight > 250
        );

        const lista = grandes.length ? grandes : candidatos;

        lista.sort(
            (a, b) =>
                (b.clientWidth * b.clientHeight) -
                (a.clientWidth * a.clientHeight)
        );

        return lista[0] || null;
    }

    function rolarMaterial() {
        const agora = Date.now();
        if (agora - ultimaRolagem < TEMPO_ENTRE_ROLAGENS) return false;

        const alvo = escolherAreaLeitura();
        if (!alvo) return false;

        const maximo = alvo.scrollHeight - alvo.clientHeight;
        const restante = maximo - alvo.scrollTop;

        if (restante <= 15) {
            atualizarStatus('📄 Final do material alcançado.');
            return false;
        }

        ultimaRolagem = agora;

        const passo = Math.max(200, Math.floor(alvo.clientHeight * 0.70));

        alvo.scrollBy({
            top: passo,
            behavior: 'smooth'
        });

        const porcentagem = Math.min(
            100,
            Math.round(
                ((alvo.scrollTop + alvo.clientHeight) / alvo.scrollHeight) * 100
            )
        );

        atualizarStatus('📄 Percorrendo material: ' + porcentagem + '%');
        return true;
    }

    function tentarFinalizar() {
        const botao = encontrarBotao([
            'finalizar lição',
            'marcar como finalizada',
            'marcar como concluída'
        ]);

        if (!botao) return false;

        if (!habilitado(botao)) {
            atualizarStatus('⏳ Aguardando liberar "Finalizar lição"...');
            return true;
        }

        atualizarStatus('✅ Finalizando lição...');
        clicar(botao);
        return true;
    }

    function tentarProsseguir() {
        const botao = encontrarBotao([
            'prosseguir',
            'próxima lição',
            'continuar'
        ]);

        if (!botao || !habilitado(botao)) return false;

        atualizarStatus('➡️ Indo para a próxima lição...');
        clicar(botao);
        return true;
    }

    function executar() {
        criarPainel();
        if (!ativo) return;

        // 1. Vídeo tem prioridade.
        const video = encontrarVideo();

        if (video) {
            if (processarVideo(video)) return;

            if (tentarFinalizar()) return;
            if (tentarProsseguir()) return;

            atualizarStatus('⏳ Vídeo terminou. Aguardando conclusão...');
            return;
        }

        // 2. Para ao detectar avaliação/quiz.
        if (detectarAvaliacaoAtual()) {
            atualizarStatus('📝 Avaliação detectada — aguardando você.');
            return;
        }

        // 3. Percorre leitura/PDF.
        if (rolarMaterial()) return;

        // 4. Finaliza e avança quando permitido.
        if (tentarFinalizar()) return;
        if (tentarProsseguir()) return;

        atualizarStatus('⏳ Aguardando a plataforma...');
    }

    const observer = new MutationObserver(() => {
        criarPainel();
    });

    function iniciar() {
        criarPainel();

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        setInterval(executar, INTERVALO);
        console.log('[HUMAND V5] Auxiliar iniciado.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
'''

path = "/mnt/data/humand-course-helper.user.js"
with open(path, "w", encoding="utf-8") as f:
    f.write(script)

print(f"Arquivo criado: {path}")
