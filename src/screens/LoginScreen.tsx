// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, // Usado para mostrar mensagens (sucesso/erro) na tela
} from 'react-native';

// Define as propriedades que esta tela pode receber.
// onLoginSuccess será uma função que o componente pai (App.tsx) passará.
interface LoginScreenProps {
  onLoginSuccess: () => void;
}

// O componente funcional da tela de login
const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Estados para armazenar o que o usuário digita nos campos
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Função que será chamada quando o botão de login for pressionado
  const handleLogin = () => {
    // A lógica de login para o trabalho da faculdade:
    // Verifica se o usuário é 'admin' e a senha é '123'
    if (username === 'admin' && password === '123') {
      Alert.alert('Sucesso', 'Login realizado com sucesso!'); // Mostra um alerta de sucesso
      onLoginSuccess(); // Chama a função que indica ao App.tsx que o login foi bem-sucedido
    } else {
      Alert.alert('Erro', 'Usuário ou senha inválidos.'); // Mostra um alerta de erro
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>

      {/* Campo para o nome de usuário */}
      <TextInput
        style={styles.input}
        placeholder="Usuário" // Texto que aparece antes de digitar
        value={username} // Valor atual do campo, ligado ao estado 'username'
        onChangeText={setUsername} // Atualiza o estado 'username' a cada digitação
        autoCapitalize="none" // Importante para não capitalizar automaticamente
      />

      {/* Campo para a senha */}
      <TextInput
        style={styles.input}
        placeholder="Senha" // Texto que aparece antes de digitar
        value={password} // Valor atual do campo, ligado ao estado 'password'
        onChangeText={setPassword} // Atualiza o estado 'password' a cada digitação
        secureTextEntry // Faz com que o texto digitado apareça como bolinhas (para senhas)
      />

      {/* Botão de Login */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos para os componentes da tela
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
    // Sombras (opcional, para um visual mais "elevado")
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

export default LoginScreen; // Exporta o componente para que possa ser usado em outros arquivos