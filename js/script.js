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

    // Agrupar itens do carrinho pelo nome para calcular promoções
    const groupedCart = cart.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = { ...item, quantity: 0 };
        }
        acc[item.name].quantity += item.quantity;
        return acc;
    }, {});

    // Encontrar caixinhas no carrinho (agora agrupadas)
    const caixinha4 = groupedCart["Caixinha 4 unidades"];
    const caixinha6 = groupedCart["Caixinha 6 unidades"];

    // Aplicar promoções para caixinha 4 unidades
    if (caixinha4) {
        const quantidade = caixinha4.quantity;
        const precoOriginal = caixinha4.price;

        if (quantidade >= 2) {
            const pares = Math.floor(quantidade / 2);
            const restantes = quantidade % 2;
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
            const pares = Math.floor(quantidade / 2);
            const restantes = quantidade % 2;
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

    // Adicionar outros itens que não são caixinhas ou que não foram agrupados
    cart.forEach(item => {
        if (item.name !== 'Caixinha 4 unidades' && item.name !== 'Caixinha 6 unidades') {
            subtotalComPromocao += item.price * item.quantity;
        } else if (!groupedCart[item.name]) { // Adicionar itens que não foram agrupados (caso haja)
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
            
            // Criar HTML base do item
            let itemHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
            `;
            
            // Adicionar sabores se existirem
            if (item.saboresTexto) {
                itemHTML += `
                    <div class="cart-item-sabores" style="background: #f0f8ff; padding: 8px; border-radius: 5px; margin: 8px 0; font-size: 0.85rem;">
                        <strong>Sabores:</strong><br>
                        ${item.saboresTexto}
                    </div>
                `;
            }
            
            itemHTML += `
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
            
            cartItem.innerHTML = itemHTML;
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
        
        // Adicionar sabores se existirem
        if (item.saboresTexto) {
            message += `  Sabores: ${item.saboresTexto}\n`;
        }
        
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



// Lista de sabores disponíveis
const saboresDisponiveis = [
    { id: 'tradicional', nome: 'Tradicional', emoji: '🍫', descricao: 'Brigadeiro de chocolate ao leite com confeito de chocolate ao leite ou colorido' },
    { id: 'beijinho', nome: 'Beijinho', emoji: '🥥', descricao: 'Brigadeiro de coco, confeitado com açúcar e cravo' },
    { id: 'bicho_pe', nome: 'Bicho de pé', emoji: '💗', descricao: 'Brigadeiro de Nesquik, confeitado com açúcar' },
    { id: 'pacoca', nome: 'Paçoca', emoji: '🥜', descricao: 'Brigadeiro de Paçoca, confeitado com Paçoca' },
    { id: 'chocolate_branco', nome: 'Chocolate Branco', emoji: '🤍', descricao: 'Brigadeiro de chocolate branco com confeito de chocolate branco' },
    { id: 'churros', nome: 'Churros', emoji: '🍯', descricao: 'Brigadeiro de doce de leite, confeitado com açúcar, canela e doce de leite' },
    { id: 'ferrero', nome: 'Ferrero Rocher', emoji: '🌰', descricao: 'Brigadeiro de chocolate meio-amargo, confeitado com amendoim e Nutella' },
    { id: 'ninho_nutella', nome: 'Ninho com Nutella', emoji: '🍼', descricao: 'Brigadeiro de leite Ninho, confeitado com leite Ninho e Nutella' },
    { id: 'nutella', nome: 'Nutella', emoji: '🍫', descricao: 'Brigadeiro de Nutella, confeitado com chocolate ao leite e Nutella' },
    { id: 'surpresinha_uva', nome: 'Surpresinha de uva', emoji: '🍇', descricao: 'Brigadeiro de leite Ninho com uva, confeitado com leite Ninho' },
    { id: 'casadinho', nome: 'Casadinho', emoji: '💑', descricao: 'Brigadeiro de chocolate ao leite e brigadeiro de chocolate branco' },
    { id: 'casadinho_rosa', nome: 'Casadinho rosa', emoji: '💖', descricao: 'Brigadeiro de Nesquik e brigadeiro de Ninho' },
    { id: 'oreo', nome: 'Oreo', emoji: '🍪', descricao: 'Brigadeiro de oreo, confeitado com açúcar e oreo' }
];

// Variáveis para seleção de sabores
let currentSelection = {
    name: '',
    price: 0,
    image: '',
    quantity: 0,
    sabores: {}
};

// Função para alternar modal de sabores
function toggleSaboresModal() {
    const modal = document.getElementById('saboresModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Função para abrir seleção de sabores
function openSaboresSelection(name, price, image, quantity) {
    currentSelection = {
        name: name,
        price: price,
        image: image,
        quantity: quantity,
        sabores: {}
    };
    
    const modal = document.getElementById('selecaoSaboresModal');
    const titulo = document.getElementById('selecaoTitulo');
    const content = document.getElementById('selecaoSaboresContent');
    
    titulo.textContent = `Escolha os sabores para ${name}`;
    
    let html = `
        <div class="total-info">
            <h4>Total de brigadeiros: ${quantity}</h4>
            <p>Selecione a quantidade de cada sabor desejado</p>
            <div id="quantidadeRestante">Restam: <strong>${quantity}</strong> brigadeiros para selecionar</div>
        </div>
    `;
    
    saboresDisponiveis.forEach(sabor => {
        html += `
            <div class="sabor-selector" id="selector-${sabor.id}">
                <div class="sabor-selector-header">
                    <h4>${sabor.emoji} ${sabor.nome}</h4>
                    <input type="number" 
                           class="quantity-input" 
                           id="qty-${sabor.id}" 
                           min="0" 
                           max="${quantity}" 
                           value="0"
                           onchange="updateSaborQuantity('${sabor.id}', this.value)">
                </div>
                <p>${sabor.descricao}</p>
            </div>
        `;
    });
    
    content.innerHTML = html;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    updateQuantidadeRestante();
}

// Função para atualizar quantidade de sabor
function updateSaborQuantity(saborId, quantidade) {
    const qty = parseInt(quantidade) || 0;
    
    if (qty > 0) {
        currentSelection.sabores[saborId] = qty;
        document.getElementById(`selector-${saborId}`).classList.add('selected');
    } else {
        delete currentSelection.sabores[saborId];
        document.getElementById(`selector-${saborId}`).classList.remove('selected');
    }
    
    updateQuantidadeRestante();
}

// Função para atualizar quantidade restante
function updateQuantidadeRestante() {
    const totalSelecionado = Object.values(currentSelection.sabores).reduce((sum, qty) => sum + qty, 0);
    const restante = currentSelection.quantity - totalSelecionado;
    
    const restanteDiv = document.getElementById('quantidadeRestante');
    if (restanteDiv) {
        restanteDiv.innerHTML = `Restam: <strong>${restante}</strong> brigadeiros para selecionar`;
        
        if (restante < 0) {
            restanteDiv.style.color = '#f44336';
            restanteDiv.innerHTML += ' <br><small>⚠️ Você selecionou mais brigadeiros do que o permitido!</small>';
        } else if (restante === 0) {
            restanteDiv.style.color = '#4caf50';
            restanteDiv.innerHTML += ' <br><small>✅ Perfeito! Todos os brigadeiros foram selecionados.</small>';
        } else {
            restanteDiv.style.color = '#666';
        }
    }
    
    // Atualizar inputs máximos
    saboresDisponiveis.forEach(sabor => {
        const input = document.getElementById(`qty-${sabor.id}`);
        if (input) {
            const currentValue = parseInt(input.value) || 0;
            const maxAllowed = currentValue + restante;
            input.max = maxAllowed;
        }
    });
    
    // Habilitar/desabilitar botão confirmar
    const btnConfirmar = document.querySelector('.btn-confirmar');
    if (btnConfirmar) {
        btnConfirmar.disabled = restante !== 0;
    }
}

// Função para fechar seleção de sabores
function closeSelecaoSabores() {
    const modal = document.getElementById('selecaoSaboresModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Limpar seleção
    currentSelection = {
        name: '',
        price: 0,
        image: '',
        quantity: 0,
        sabores: {}
    };
}

// Função para confirmar seleção de sabores
function confirmarSelecaoSabores() {
    const totalSelecionado = Object.values(currentSelection.sabores).reduce((sum, qty) => sum + qty, 0);
    
    if (totalSelecionado !== currentSelection.quantity) {
        showToast('Por favor, selecione exatamente ' + currentSelection.quantity + ' brigadeiros', 'error');
        return;
    }
    
    // Criar descrição dos sabores selecionados
    const saboresTexto = [];
    Object.entries(currentSelection.sabores).forEach(([saborId, qty]) => {
        const sabor = saboresDisponiveis.find(s => s.id === saborId);
        if (sabor && qty > 0) {
            saboresTexto.push(`${qty}x ${sabor.nome}`);
        }
    });
    
    // Verificar se o item já existe no carrinho
    const existingItem = cart.find(item => 
        item.name === currentSelection.name && 
        JSON.stringify(item.sabores) === JSON.stringify(currentSelection.sabores)
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: currentSelection.name,
            price: currentSelection.price,
            image: currentSelection.image,
            quantity: 1,
            sabores: currentSelection.sabores,
            saboresTexto: saboresTexto.join(', ')
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    closeSelecaoSabores();
    
    showAddToCartFeedback();
    showToast(`${currentSelection.name} adicionado ao carrinho!`, 'success');
}

// Função para contatar via WhatsApp para pedidos grandes
function contatarWhatsApp(itemName, price) {
    const mensagem = `Olá! Gostaria de fazer um pedido de *${itemName}* (R$ ${price.toFixed(2).replace('.', ',')}).

Preciso conversar sobre os sabores disponíveis e as quantidades de cada um.

Aguardo seu contato! 😊`;
    
    const numeroWhatsApp = '5511985580560';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
}

// Função para mostrar toast (notificação)
function showToast(message, type = 'info') {
    // Remover toast existente se houver
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Estilos do toast
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 3000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
    `;
    
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Adicionar estilos de animação para o toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyles);

// Fechar modais ao clicar fora
document.addEventListener('click', function(e) {
    const saboresModal = document.getElementById('saboresModal');
    const selecaoModal = document.getElementById('selecaoSaboresModal');
    
    if (e.target === saboresModal) {
        toggleSaboresModal();
    }
    
    if (e.target === selecaoModal) {
        closeSelecaoSabores();
    }
});

