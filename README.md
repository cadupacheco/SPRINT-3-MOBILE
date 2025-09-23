# Mottu Patio Manager - IdeaTec Tecnologia 🏍️

Sistema completo de gestão inteligente de pátios para motos, desenvolvido pela IdeaTec Tecnologia em parceria com a Mottu.

## Sobre a IdeaTec Tecnologia

A **IdeaTec Tecnologia** é uma empresa especializada em soluções inovadoras de tecnologia, focada no desenvolvimento de sistemas inteligentes para gestão de frotas e mobilidade urbana. Nossa missão é transformar operações complexas em soluções simples e eficientes através da tecnologia.

## Integrantes da Equipe

- **[Carlos Eduardo Rodrigues Coelho Pacheco]** - RM 557323
- **[Pedro Augusto Costa ladeira]** -  RM 558514
- **[João Pedro Amorim Brito Virgens]** - RM 559213

## Sobre o Projeto

O **Mottu Patio Manager** é uma solução completa de mapeamento inteligente e gestão de motos em pátios, desenvolvida especificamente para atender às necessidades operacionais da Mottu. O sistema oferece monitoramento em tempo real, gestão eficiente de recursos e interface intuitiva para operadores.

### Funcionalidades Principais

- **Dashboard Executivo**: Visão geral completa com indicadores de performance
- **Mapeamento Inteligente**: Localização precisa das motos no pátio
- **Gestão de Status**: Controle em tempo real do status das motocicletas
- **Relatórios Avançados**: Estatísticas detalhadas e análises de performance
- **Interface Responsiva**: Acesso via dispositivos móveis e desktop
- **Sincronização em Tempo Real**: Dados sempre atualizados

## 🛠️ Tecnologias Utilizadas

### Frontend Mobile
- **React Native** - Framework principal
- **Expo SDK** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **React Native Paper** - Componentes de UI

### Gerenciamento de Estado
- **Context API** - Estado global da aplicação
- **useReducer** - Gerenciamento complexo de estado
- **AsyncStorage** - Persistência de dados local

### Ferramentas de Desenvolvimento
- **ESLint** - Análise estática de código
- **Prettier** - Formatação de código
- **Metro Bundler** - Empacotamento de arquivos

## 🚀 Instalação e Configuração

### Pré-requisitos

```
Node.js >= 16.x
npm >= 8.x ou yarn >= 1.22.x
Expo CLI
iOS Simulator / Android Emulator ou dispositivo físico
```

### Clonando o Repositório

```
git clone git clone https://github.com/AntonioCarvalhoFIAP/challenge-1-JPAmorimBV
cd mottu-patio-manager
```

### Instalação das Dependências

```
# Usando npm
npm install

# Usando yarn
yarn install
```

### Configuração do Ambiente

1. Copie o arquivo de configuração:
```
cp .env.example .env
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento

```
# Iniciar o servidor de desenvolvimento
npx expo start

# Opções de execução:
# Pressione 'a' para Android Emulator
# Pressione 'i' para iOS Simulator
# Pressione 'w' para executar na web
# Escaneie o QR code com Expo Go para dispositivo físico
```

### Build de Produção

```
# Build para Android
npx expo build:android

# Build para iOS
npx expo build:ios
```

## 📱 Arquitetura da Solução

O projeto segue uma arquitetura modular e escalável:

```
src/
├── components/          # Componentes reutilizáveis
├── context/            # Contextos para estado global
├── navigation/         # Configuração de navegação
├── screens/           # Telas da aplicação
├── utils/             # Funções utilitárias
└── assets/            # Recursos estáticos
```

## 🔧 Funcionalidades Técnicas

### Gestão de Estado
- Context API para estado global
- useReducer para lógica complexa
- AsyncStorage para persistência

### Performance
- Lazy loading de componentes
- Memoização com React.memo
- Otimização de re-renders

### Segurança
- Validação de dados de entrada
- Tratamento seguro de erros
- Sanitização de dados

## 📊 Métricas e Monitoramento

O sistema inclui:
- Dashboard com indicadores em tempo real
- Relatórios de utilização
- Métricas de performance das motos
- Análises de eficiência operacional

## 🔄 Fluxo de Desenvolvimento

1. **Planejamento**: Definição de requisitos e arquitetura
2. **Desenvolvimento**: Implementação das funcionalidades
3. **Testes**: Validação e correções
4. **Deploy**: Publicação em produção
5. **Monitoramento**: Acompanhamento pós-deploy

## 📈 Roadmap

### Versão 2.0 (Prevista)
- [ ] Integração com APIs REST
- [ ] Notificações push
- [ ] Modo offline
- [ ] Relatórios avançados
- [ ] Dashboard web complementar

### Versão 3.0 (Futuro)
- [ ] Inteligência artificial para predições
- [ ] Integração IoT avançada
- [ ] Análise de dados em tempo real
- [ ] Aplicativo para entregadores

## 📄 Licença

Este projeto é propriedade da **IdeaTec Tecnologia** e está licenciado sob termos comerciais. Para mais informações sobre licenciamento, entre em contato conosco.

---

© 2025 IdeaTec Tecnologia - Todos os direitos reservados | Desenvolvido para Mottu
```

