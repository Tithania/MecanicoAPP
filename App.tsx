// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Container para o sistema de navegação
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Navigator para navegação em pilha

// Importa todos os componentes de tela que serão usados na navegação
import LoginScreen from './src/screens/LoginScreen';
import Dashboard from './src/screens/Dashboard';
import CadastroClient from './src/screens/CadastroClient';
import Servicos from './src/screens/Servicos';

// Cria uma instância do Stack Navigator.
// 'Stack' será usado para definir as telas e suas opções de navegação.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // NavigationContainer é o componente de nível superior que gerencia o estado da navegação.
    // Ele deve envolver toda a sua estrutura de navegação.
    <NavigationContainer>
      {/*
        Stack.Navigator define uma pilha de telas.
        'initialRouteName' define qual tela será exibida primeiro quando o aplicativo iniciar.
      */}
      <Stack.Navigator initialRouteName="Login">
        {/*
          Stack.Screen define cada tela individual na sua pilha de navegação.
          Cada tela precisa de um 'name' (nome único para a rota) e um 'component' (o componente React da tela).
        */}

        {/* Tela de Login */}
        <Stack.Screen
          name="Login" // Nome da rota para a tela de Login
          component={LoginScreen} // Componente React da tela de Login
          options={{ headerShown: false }} // Opção para esconder o cabeçalho de navegação nesta tela
        />

        {/* Tela do Dashboard */}
        <Stack.Screen
          name="Dashboard" // Nome da rota para o Dashboard
          component={Dashboard} // Componente React da tela do Dashboard
          options={{ headerShown: false }} // Opção para esconder o cabeçalho de navegação (o Dashboard tem seu próprio título)
        />

        {/* Tela de Gerenciamento de Clientes */}
        <Stack.Screen
          name="CadastroClient" // Nome da rota para o Gerenciamento de Clientes
          component={CadastroClient} // Componente React da tela de Gerenciamento de Clientes
          options={{ title: 'Cadastro Clientes' }} // Título exibido no cabeçalho de navegação desta tela
        />

        {/* Tela de Cadastro de Serviços */}
        <Stack.Screen
          name="Servicos" // Certifique-se de que este nome de rota corresponde exatamente ao que você usa em navigation.navigate()
          component={Servicos} // Certifique-se de que este é o componente correto importado
          options={{ title: 'Cadastro de Serviços' }}
        />

        {/*
          Você pode adicionar mais telas aqui, seguindo o mesmo padrão:
          <Stack.Screen name="NomeDaRota" component={SeuComponenteDeTela} options={{ ... }} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
