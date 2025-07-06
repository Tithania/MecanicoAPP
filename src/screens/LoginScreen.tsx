// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, // Usado para exibir mensagens de sucesso/erro
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Importa useNavigation e NavigationProp para navegação

// Define os tipos de parâmetros para as rotas do seu Stack Navigator.
// Isso ajuda o TypeScript a entender quais rotas estão disponíveis e quais parâmetros elas esperam.
type RootStackParamList = {
  Login: undefined; // A tela de Login não recebe parâmetros específicos via navegação
  Dashboard: undefined; // A tela de Dashboard também não recebe parâmetros
  ClientManagement: undefined; // A tela de gerenciamento de clientes também não recebe parâmetros
};

export default function LoginScreen() {
  // Obtém o objeto de navegação, tipado com as rotas definidas acima.
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Estados para armazenar o que o usuário digita nos campos de usuário e senha
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  /**
   * Função para lidar com a tentativa de login.
   * Verifica as credenciais e navega para o Dashboard em caso de sucesso.
   */
  const handleLogin = () => {
    // Credenciais fixas para o trabalho de faculdade (usuário: 'admin', senha: '123')
    if (username === 'admin' && password === '123') {
      Alert.alert('Sucesso', 'Login realizado com sucesso!'); // Exibe um alerta de sucesso
      // Navega para a tela 'Dashboard' após o login bem-sucedido.
      // O 'replace' garante que o usuário não possa voltar para a tela de login pelo botão 'voltar'.
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Erro', 'Usuário ou senha inválidos.'); // Exibe um alerta de erro
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>

      {/* Campo para o nome de usuário */}
      <TextInput
        style={styles.input}
        placeholder="Usuário" // Texto que aparece antes do usuário digitar
        value={username} // O valor atual do campo, ligado ao estado 'username'
        onChangeText={setUsername} // Função que atualiza o estado 'username' a cada digitação
        autoCapitalize="none" // Desativa a capitalização automática para nomes de usuário
        autoCorrect={false} // Desativa a correção automática
      />

      {/* Campo para a senha */}
      <TextInput
        style={styles.input}
        placeholder="Senha" // Texto que aparece antes do usuário digitar
        value={password} // O valor atual do campo, ligado ao estado 'password'
        onChangeText={setPassword} // Função que atualiza o estado 'password' a cada digitação
        secureTextEntry // Faz com que o texto digitado apareça como bolinhas (para senhas)
        autoCapitalize="none" // Desativa a capitalização automática
        autoCorrect={false} // Desativa a correção automática
      />

      {/* Botão de Login */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos para os componentes da tela de Login
const styles = StyleSheet.create({
  container: {
    flex: 1, // Faz com que o container ocupe todo o espaço disponível
    justifyContent: 'center', // Centraliza os itens verticalmente
    alignItems: 'center', // Centraliza os itens horizontalmente
    backgroundColor: '#f0f0f0', // Cor de fundo da tela
    padding: 20, // Espaçamento interno
  },
  title: {
    fontSize: 28, // Tamanho da fonte
    fontWeight: 'bold', // Negrito
    marginBottom: 40, // Margem inferior
    color: '#333', // Cor do texto
  },
  input: {
    width: '100%', // Ocupa 100% da largura do container pai
    height: 50, // Altura do campo
    backgroundColor: '#fff', // Cor de fundo do campo
    borderRadius: 8, // Borda arredondada
    paddingHorizontal: 15, // Espaçamento interno horizontal
    marginBottom: 15, // Margem inferior
    fontSize: 16, // Tamanho da fonte
    borderWidth: 1, // Largura da borda
    borderColor: '#ddd', // Cor da borda
  },
  button: {
    width: '100%', // Ocupa 100% da largura do container pai
    height: 50, // Altura do botão
    backgroundColor: '#007bff', // Cor de fundo do botão (azul)
    borderRadius: 8, // Borda arredondada
    justifyContent: 'center', // Centraliza o texto verticalmente
    alignItems: 'center', // Centraliza o texto horizontalmente
    marginTop: 20, // Margem superior
    // Sombras para um visual mais "elevado"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff', // Cor do texto do botão
    fontSize: 18, // Tamanho da fonte
    fontWeight: 'bold', // Negrito
  },
});
