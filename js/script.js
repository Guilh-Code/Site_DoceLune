// Variáveis globais
let cart = [];

// Elementos DOM
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalElement = document.getElementById('cartTotal');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling para links de navegação
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Menu mobile responsivo
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Animação suave do hambúrguer
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Fechar menu ao clicar em um link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('cepInput');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
            }
            e.target.value = value;
        });
    }

    // Inicializar carrossel de avaliações
    initAvaliacoesCarousel();

    // Carregar carrinho do localStorage
    loadCartFromStorage();
});

// Função para inicializar carrossel de avaliações
function initAvaliacoesCarousel() {
    const track = document.getElementById('avaliacoesTrack');
    if (track) {
        // Duplicar os cards para loop infinito
        const cards = track.innerHTML;
        track.innerHTML = cards + cards;
        
        // CONFIGURAÇÃO DE VELOCIDADE DO CARROSSEL
        // Para alterar a velocidade, modifique o valor abaixo:
        // Valores menores = mais rápido | Valores maiores = mais devagar
        const VELOCIDADE_CARROSSEL = 8000; // 8 segundos para completar um ciclo (mais devagar)
        
        let currentTranslate = 0;
        const cardWidth = 320; // Largura do card + gap
        const totalCards = track.children.length / 2; // Dividir por 2 porque duplicamos
        const maxTranslate = -(cardWidth * totalCards);
        
        // Função para mover o carrossel
        function moveCarousel() {
            currentTranslate -= 1; // Velocidade de movimento (pixels por frame)
            
            if (currentTranslate <= maxTranslate) {
                currentTranslate = 0; // Reset para loop infinito
            }
            
            track.style.transform = `translateX(${currentTranslate}px)`;
            requestAnimationFrame(moveCarousel);
        }
        
        // Iniciar animação automática mais devagar
        let animationId;
        function startAutoScroll() {
            animationId = setInterval(() => {
                currentTranslate -= 0.5; // Movimento mais suave e devagar
                
                if (currentTranslate <= maxTranslate) {
                    currentTranslate = 0;
                }
                
                track.style.transform = `translateX(${currentTranslate}px)`;
            }, 16); // ~60fps para movimento suave
        }
        
        // Pausar ao passar o mouse
        track.addEventListener('mouseenter', () => {
            clearInterval(animationId);
        });
        
        // Retomar ao sair o mouse
        track.addEventListener('mouseleave', () => {
            startAutoScroll();
        });
        
        // Iniciar carrossel
        startAutoScroll();
    }
}

// Função para alternar carrinho
function toggleCart() {
    cartSidebar.classList.toggle('active');
    
    // Adicionar overlay quando carrinho estiver aberto
    if (cartSidebar.classList.contains('active')) {
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;
        overlay.onclick = toggleCart;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    } else {
        const overlay = document.querySelector('.cart-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
        document.body.style.overflow = 'auto';
    }
}

// Função para adicionar item ao carrinho
function addToCart(name, price, image) {
    // Verificar se o item já existe no carrinho
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    
    // Feedback visual melhorado
    showAddToCartFeedback();
    showToast(`${name} adicionado ao carrinho!`, 'success');
}

// Função para mostrar feedback visual ao adicionar item
function showAddToCartFeedback() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.transform = 'scale(1.3)';
    cartIcon.style.color = '#E91E63';
    
    // Animação de pulso
    cartIcon.style.animation = 'pulse 0.6s ease';
    
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
        cartIcon.style.color = '#FFFFFF';
        cartIcon.style.animation = 'none';
    }, 600);
}

// Função para remover item do carrinho
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartDisplay();
    saveCartToStorage();
    showToast('Item removido do carrinho', 'info');
}

// Função para atualizar quantidade
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

// Função para calcular promoções das caixinhas
function calcularPromocoes() {
    let subtotalComPromocao = 0;
    let promocoesAplicadas = [];
    
    // Encontrar caixinhas no carrinho
    const caixinha4 = cart.find(item => item.name === 'Caixinha 4 unidades');
    const caixinha6 = cart.find(item => item.name === 'Caixinha 6 unidades');
    
    // Aplicar promoções para caixinha 4 unidades
    if (caixinha4) {
        const quantidade = caixinha4.quantity;
        const precoOriginal = caixinha4.price;
        
        if (quantidade >= 2) {
            // Calcular quantos pares de 2 caixinhas temos
            const pares = Math.floor(quantidade / 2);
            const restantes = quantidade % 2;
            
            // Preço promocional: 2 caixinhas por R$ 20
            const precoPromocional = pares * 20 + restantes * precoOriginal;
            const desconto = (quantidade * precoOriginal) - precoPromocional;
            
            subtotalComPromocao += precoPromocional;
            
            if (desconto > 0) {
                promocoesAplicadas.push({
                    item: 'Caixinha 4 unidades',
                    descricao: `${pares} par(es) de caixinhas por R$ 20,00 cada`,
                    desconto: desconto
                });
            }
        } else {
            subtotalComPromocao += quantidade * precoOriginal;
        }
    }
    
    // Aplicar promoções para caixinha 6 unidades
    if (caixinha6) {
        const quantidade = caixinha6.quantity;
        const precoOriginal = caixinha6.price;
        
        if (quantidade >= 2) {
            // Calcular quantos pares de 2 caixinhas temos
            const pares = Math.floor(quantidade / 2);
            const restantes = quantidade % 2;
            
            // Preço promocional: 2 caixinhas por R$ 32
            const precoPromocional = pares * 32 + restantes * precoOriginal;
            const desconto = (quantidade * precoOriginal) - precoPromocional;
            
            subtotalComPromocao += precoPromocional;
            
            if (desconto > 0) {
                promocoesAplicadas.push({
                    item: 'Caixinha 6 unidades',
                    descricao: `${pares} par(es) de caixinhas por R$ 32,00 cada`,
                    desconto: desconto
                });
            }
        } else {
            subtotalComPromocao += quantidade * precoOriginal;
        }
    }
    
    // Adicionar outros itens que não são caixinhas
    cart.forEach(item => {
        if (item.name !== 'Caixinha 4 unidades' && item.name !== 'Caixinha 6 unidades') {
            subtotalComPromocao += item.price * item.quantity;
        }
    });
    
    return {
        subtotalComPromocao,
        promocoesAplicadas
    };
}

// Função para atualizar display do carrinho
function updateCartDisplay() {
    // Limpar itens atuais
    cartItems.innerHTML = '';
    
    // Calcular promoções
    const { subtotalComPromocao, promocoesAplicadas } = calcularPromocoes();
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Seu carrinho está vazio</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">
                            -
                        </button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">
                            +
                        </button>
                        <button class="quantity-btn" onclick="removeFromCart('${item.name}')" style="background: #E91E63; margin-left: 10px;">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        // Mostrar promoções aplicadas
        if (promocoesAplicadas.length > 0) {
            const promocoesDiv = document.createElement('div');
            promocoesDiv.style.cssText = `
                background: #e8f5e8;
                border: 1px solid #4caf50;
                border-radius: 8px;
                padding: 10px;
                margin-top: 15px;
            `;
            
            let promocoesHTML = '<h5 style="color: #2e7d32; margin: 0 0 8px 0;">🎉 Promoções Aplicadas:</h5>';
            promocoesAplicadas.forEach(promocao => {
                promocoesHTML += `<p style="margin: 4px 0; font-size: 0.9rem; color: #2e7d32;">
                    • ${promocao.descricao}<br>
                    <span style="font-weight: bold;">Economia: R$ ${promocao.desconto.toFixed(2).replace('.', ',')}</span>
                </p>`;
            });
            
            promocoesDiv.innerHTML = promocoesHTML;
            cartItems.appendChild(promocoesDiv);
        }
    }
    
    // Atualizar totais
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCount.textContent = totalItems;
    cartTotalElement.textContent = subtotalComPromocao.toFixed(2).replace('.', ',');
    
    // Mostrar/esconder elementos
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Função para calcular frete por CEP
async function calcularFrete() {
    const cepInput = document.getElementById('cepInput');
    const cep = cepInput.value.trim().replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (!cep || cep.length !== 8) {
        showToast('Por favor, digite um CEP válido (8 dígitos)', 'error');
        return;
    }
    
    // Mostrar loading
    const freteBtn = document.querySelector('.frete-btn');
    const originalText = freteBtn.innerHTML;
    freteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
    freteBtn.disabled = true;
    
    try {
        // CEP da cliente DoceLune (Bia)
        const cepOrigem = '03461080'; // CEP da Bia sem hífen
        
        // Verificar se é o mesmo CEP da origem (frete grátis)
        if (cep === cepOrigem) {
            freteValue = 0;
            
            // Mostrar resultado de frete grátis
            document.getElementById('freteResult').style.display = 'block';
            document.getElementById('freteResult').innerHTML = `
                <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin-top: 10px;">
                    <strong style="color: #2e7d32;">🎉 Frete GRÁTIS!</strong>
                    <button onclick="removerFrete()" class="remove-frete-btn" title="Remover frete">✕</button><br>
                    <span style="color: #666; font-size: 0.9rem;">Entrega no mesmo local da confeitaria</span>
                </div>
            `;
            
            updateCartDisplay();
            showToast('Frete grátis! Mesmo local da confeitaria', 'success');
            
            // Salvar CEP do cliente para usar no WhatsApp
            localStorage.setItem('docelune_cliente_cep', cep);
            
            // Restaurar botão
            freteBtn.innerHTML = originalText;
            freteBtn.disabled = false;
            return;
        }
        
        // Primeiro verificar se o CEP é de São Paulo - SP
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const viaCepData = await viaCepResponse.json();
        
        if (viaCepData.erro) {
            throw new Error('CEP não encontrado');
        }
        
        // Verificar se é de São Paulo - SP (onde a Bia atende)
        if (viaCepData.localidade.toLowerCase() !== 'são paulo' || viaCepData.uf.toLowerCase() !== 'sp') {
            // Mostrar mensagem de área não atendida
            document.getElementById('freteResult').style.display = 'block';
            document.getElementById('freteResult').innerHTML = `
                <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 15px; margin-top: 10px;">
                    <i class="fas fa-exclamation-triangle" style="color: #f44336; margin-right: 8px;"></i>
                    <strong style="color: #f44336;">Área de entrega não atendida</strong><br>
                    <span style="color: #666; font-size: 0.9rem;">Realizamos entregas apenas na região de São Paulo - SP, próximo ao Jardim Vila Formosa</span>
                </div>
            `;
            freteValue = 0;
            updateCartDisplay();
            showToast('Entregas apenas em São Paulo - SP', 'error');
            
            // Restaurar botão
            freteBtn.innerHTML = originalText;
            freteBtn.disabled = false;
            return;
        }
        
        // Buscar coordenadas dos CEPs
        const coordOrigem = await buscarCoordenadasPorCEP(cepOrigem);
        const coordDestino = await buscarCoordenadasPorCEP(cep);
        
        if (coordOrigem && coordDestino) {
            // Calcular distância
            const distancia = calcularDistanciaHaversine(
                coordOrigem.lat, coordOrigem.lng,
                coordDestino.lat, coordDestino.lng
            );
            
            if (distancia >= 0) {
                // Verificar se a distância está dentro do limite de 30km
                if (distancia > 30) {
                    // Mostrar mensagem de distância excedida
                    document.getElementById('freteResult').style.display = 'block';
                    document.getElementById('freteResult').innerHTML = `
                        <div style="background: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 15px; margin-top: 10px;">
                            <i class="fas fa-exclamation-triangle" style="color: #f44336; margin-right: 8px;"></i>
                            <strong style="color: #f44336;">Não entregamos para esta região</strong><br>
                            <span style="color: #666; font-size: 0.9rem;">Realizamos entregas apenas em um raio de 30km do CEP 03461-080. Distância: ${distancia.toFixed(1)} km</span>
                        </div>
                    `;
                    freteValue = 0;
                    updateCartDisplay();
                    showToast(`Distância de ${distancia.toFixed(1)} km excede o limite de 30km`, 'error');
                    
                    // Restaurar botão
                    freteBtn.innerHTML = originalText;
                    freteBtn.disabled = false;
                    return;
                }
                
                // Frete = R$ 0,80 por km (ida e volta)
                freteValue = distancia * 0.80 * 2; // Multiplicar por 2 para ida e volta
                
                // Mostrar resultado
                document.getElementById('freteResult').style.display = 'block';
                document.getElementById('freteResult').innerHTML = `
                    <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin-top: 10px;">
                        <strong style="color: #2e7d32;">Frete: R$ ${freteValue.toFixed(2).replace('.', ',')}</strong>
                        <button onclick="removerFrete()" class="remove-frete-btn" title="Remover frete">✕</button><br>
                        <span style="color: #666; font-size: 0.9rem;">Distância aproximada: ${distancia.toFixed(1)} km (ida e volta)</span>
                    </div>
                `;
                
                updateCartDisplay();
                showToast(`Frete calculado: R$ ${freteValue.toFixed(2).replace('.', ',')}`, 'success');
                
                // Salvar CEP do cliente para usar no WhatsApp
                localStorage.setItem('docelune_cliente_cep', cep);
            } else {
                throw new Error('Não foi possível calcular a distância');
            }
        } else {
            throw new Error('CEP não encontrado');
        }
    } catch (error) {
        console.error('Erro ao calcular frete:', error);
        showToast('CEP não encontrado ou erro no cálculo. Verifique o CEP digitado.', 'error');
        
        // Limpar resultado anterior
        document.getElementById('freteResult').style.display = 'none';
        freteValue = 0;
        updateCartDisplay();
    } finally {
        // Restaurar botão
        freteBtn.innerHTML = originalText;
        freteBtn.disabled = false;
    }
}

// Função para remover o frete calculado
function removerFrete() {
    // Resetar valor do frete
    freteValue = 0;
    
    // Ocultar resultado do frete
    const freteResult = document.getElementById('freteResult');
    const freteTotal = document.getElementById('freteTotal');
    
    if (freteResult) freteResult.style.display = 'none';
    if (freteTotal) freteTotal.style.display = 'none';
    
    // Limpar campo de CEP
    const cepInput = document.getElementById('cepInput');
    if (cepInput) cepInput.value = '';
    
    // Remover CEP do localStorage
    localStorage.removeItem('docelune_cliente_cep');
    
    // Atualizar display do carrinho
    updateCartDisplay();
    
    // Mostrar toast de confirmação
    showToast('Frete removido com sucesso!', 'success');
}

// Função para buscar coordenadas por CEP usando ViaCEP + OpenStreetMap
async function buscarCoordenadasPorCEP(cep) {
    try {
        // Primeiro, buscar informações do CEP via ViaCEP
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const viaCepData = await viaCepResponse.json();
        
        if (viaCepData.erro) {
            throw new Error('CEP não encontrado');
        }
        
        // Construir endereço para geocodificação
        const endereco = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
        
        // Buscar coordenadas via Nominatim
        const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`
        );
        const nominatimData = await nominatimResponse.json();
        
        if (nominatimData && nominatimData.length > 0) {
            return {
                lat: parseFloat(nominatimData[0].lat),
                lng: parseFloat(nominatimData[0].lon)
            };
        }
        
        // Fallback: tentar apenas com cidade e estado
        const enderecoSimples = `${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
        const fallbackResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoSimples)}&limit=1`
        );
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData && fallbackData.length > 0) {
            return {
                lat: parseFloat(fallbackData[0].lat),
                lng: parseFloat(fallbackData[0].lon)
            };
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao buscar coordenadas:', error);
        return null;
    }
}

// Função para calcular distância entre dois endereços
async function calcularDistancia(origem, destino) {
    try {
        // Usar API de geocodificação gratuita (OpenStreetMap Nominatim)
        const coordOrigem = await geocodificar(origem);
        const coordDestino = await geocodificar(destino);
        
        if (coordOrigem && coordDestino) {
            // Calcular distância usando fórmula de Haversine
            const distancia = calcularDistanciaHaversine(
                coordOrigem.lat, coordOrigem.lon,
                coordDestino.lat, coordDestino.lon
            );
            return distancia;
        }
        return 0;
    } catch (error) {
        console.error('Erro ao calcular distância:', error);
        return 0;
    }
}

// Função para geocodificar endereço
async function geocodificar(endereco) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Erro na geocodificação:', error);
        return null;
    }
}

// Função para calcular distância usando fórmula de Haversine
function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    return distancia;
}

// Função para enviar pedido para WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!', 'error');
        return;
    }
    
    // Obter dados dos campos de endereço
    const nomeInput = document.getElementById('nomeInput');
    const enderecoInput = document.getElementById('enderecoInput');
    const cepInput = document.getElementById('cepInput');
    
    const nome = nomeInput ? nomeInput.value.trim() : '';
    const endereco = enderecoInput ? enderecoInput.value.trim() : '';
    const cep = cepInput ? cepInput.value.trim() : '';
    
    // Validar se os campos obrigatórios estão preenchidos
    if (!nome) {
        showToast('Por favor, preencha seu nome!', 'error');
        return;
    }
    
    if (!endereco) {
        showToast('Por favor, preencha o endereço completo!', 'error');
        return;
    }
    
    if (!cep) {
        showToast('Por favor, preencha o CEP!', 'error');
        return;
    }
    
    // Calcular promoções
    const { subtotalComPromocao, promocoesAplicadas } = calcularPromocoes();
    
    let message = '🍰 *Pedido DoceLune* 🍰\n\n';
    
    // Dados do cliente
    message += '👤 *Dados do Cliente:*\n';
    message += `• Nome: ${nome}\n`;
    message += `• Endereço: ${endereco}\n`;
    message += `• CEP: ${cep}\n\n`;
    
    message += '📋 *Itens do pedido:*\n';
    
    cart.forEach(item => {
        message += `• ${item.name}\n`;
        message += `  Quantidade: ${item.quantity}\n`;
        message += `  Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
        message += `  Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n\n`;
    });
    
    // Mostrar promoções aplicadas
    if (promocoesAplicadas.length > 0) {
        message += '🎉 *Promoções Aplicadas:*\n';
        promocoesAplicadas.forEach(promocao => {
            message += `• ${promocao.descricao}\n`;
            message += `  Economia: R$ ${promocao.desconto.toFixed(2).replace('.', ',')}\n`;
        });
        message += '\n';
    }
    
    message += `💵 *Total do pedido: R$ ${subtotalComPromocao.toFixed(2).replace('.', ',')}*\n\n`;
    
    message += '💳 *Condições de Pagamento:*\n';
    message += '• PIX: (11) 98558-0560\n';
    message += '• Dinheiro na entrega\n';
    message += '• Para encomendas maiores: 50% na encomenda + 50% na retirada\n\n';
    
    message += '✨ Obrigado por escolher a DoceLune!';
    
    const phoneNumber = '5511985580560';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}

// Função para salvar carrinho no localStorage
function saveCartToStorage() {
    localStorage.setItem('docelune_cart', JSON.stringify(cart));
}

// Função para carregar carrinho do localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('docelune_cart');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    updateCartDisplay();
}

// Função para limpar carrinho
function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
    
    // Limpar campos de endereço
    const nomeInput = document.getElementById('nomeInput');
    const enderecoInput = document.getElementById('enderecoInput');
    const cepInput = document.getElementById('cepInput');
    
    if (nomeInput) nomeInput.value = '';
    if (enderecoInput) enderecoInput.value = '';
    if (cepInput) cepInput.value = '';
}

// Efeitos de scroll na navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'linear-gradient(135deg, rgba(248, 187, 217, 0.95), rgba(125, 211, 192, 0.95))';
        navbar.style.backdropFilter = 'blur(15px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, var(--primary-pink), var(--secondary-mint))';
        navbar.style.backdropFilter = 'blur(10px)';
    }
});

// Função para destacar seção ativa na navegação
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Função para mostrar toast de notificação
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Prevenção de scroll quando carrinho estiver aberto
document.addEventListener('keydown', function(e) {
    if (cartSidebar.classList.contains('active') && e.key === 'Escape') {
        toggleCart();
    }
});

// Adicionar animações CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    .nav-menu a.active {
        color: var(--light-pink) !important;
    }
    
    .nav-menu a.active::after {
        width: 100% !important;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 80px;
            flex-direction: column;
            background: linear-gradient(135deg, var(--primary-pink), var(--secondary-mint));
            width: 100%;
            text-align: center;
            transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 20px 0;
            z-index: 999;
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-menu li {
            margin: 15px 0;
            opacity: 0;
            transform: translateY(20px);
            animation: slideInNav 0.3s ease forwards;
        }
        
        .nav-menu.active li:nth-child(1) { animation-delay: 0.1s; }
        .nav-menu.active li:nth-child(2) { animation-delay: 0.2s; }
        .nav-menu.active li:nth-child(3) { animation-delay: 0.3s; }
        .nav-menu.active li:nth-child(4) { animation-delay: 0.4s; }
        .nav-menu.active li:nth-child(5) { animation-delay: 0.5s; }
        
        @keyframes slideInNav {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .hamburger span {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
    }
`;
document.head.appendChild(style);

