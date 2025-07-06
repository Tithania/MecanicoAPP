import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define os tipos de parâmetros para as rotas do seu Stack Navigator.
// Isso é crucial para o TypeScript e para a navegação segura.
type RootStackParamList = {
  Login: undefined; // Rota de Login
  CadastroClient: undefined; // Rota para Gerenciamento de Clientes
  Dashboard: undefined; // Rota do próprio Dashboard
  Servicos: undefined;
  Estoque: undefined;
  // Adicione outras rotas aqui se tiver mais telas no futuro (ex: Services, Stock)
};

export default function DashboardScreen() {
  // Use StackNavigationProp para tipar corretamente o objeto de navegação
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    // LinearGradient é o componente que aplica o gradiente de fundo
    <LinearGradient
      colors={['#8A2BE2', '#4169E1']} // Tons de roxo e azul conforme o tema
      style={styles.background} // Aplica um estilo que ocupa a tela toda
      start={{ x: 0, y: 0 }} // Define o ponto de início do gradiente (canto superior esquerdo)
      end={{ x: 1, y: 1 }}    // Define o ponto final do gradiente (canto inferior direito)
    >
      {/* SafeAreaView para garantir que o conteúdo não seja cortado por entalhes ou barras de status */}
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Dashboard Principal</Text>

        <View style={styles.cardContainer}>
          {/* Card para Gerenciar Clientes */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CadastroClient')}
          >
            <Text style={styles.cardTitle}>Cadastro de Clientes</Text>
            <Text style={styles.cardDescription}>Acesse a lista de clientes e suas informações.</Text>
          </TouchableOpacity>

          {/* NOVO: Card de Cadastro de Serviços */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Servicos')} // Navega para a tela de Cadastro de Serviços
          >
            <Text style={styles.cardTitle}>Cadastrar Serviço</Text>
            <Text style={styles.cardDescription}>Registre um novo serviço para um veículo.</Text>
          </TouchableOpacity>

          {/* Card de Serviços Cadastrados (Exemplo - pode ser uma lista de serviços cadastrados) */}
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>Serviços Cadastrados</Text>
            <Text style={styles.cardDescription}>Visualize e gerencie os serviços existentes.</Text>
          </TouchableOpacity>

          {/* Card de Estoque (Exemplo de futura expansão) */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Estoque')} // Navega para a nova tela de Estoque
          >
            <Text style={styles.cardTitle}>Estoque</Text>
            <Text style={styles.cardDescription}>Controle o estoque de peças e produtos.</Text>
          </TouchableOpacity>
        </View>

        {/* Botão de Sair/Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.replace('Login')} // Volta para a tela de Login, substituindo a pilha de navegação
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Estilos para os componentes da tela de Dashboard
const styles = StyleSheet.create({
  background: {
    flex: 1, // Faz com que o gradiente ocupe toda a tela
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    paddingTop: 40, // Espaçamento superior para a barra de status
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff', // Cor do texto branca
    marginBottom: 40, // Margem inferior
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Sombra no texto para melhor legibilidade
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  cardContainer: {
    width: '90%', // Ocupa 90% da largura da tela
    flexDirection: 'row', // Organiza os cards em linha
    flexWrap: 'wrap', // Permite que os cards quebrem para a próxima linha
    justifyContent: 'space-around', // Distribui o espaço igualmente entre os cards
    marginBottom: 30, // Margem inferior
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fundo semi-transparente (branco com 20% de opacidade)
    borderRadius: 15, // Borda arredondada
    padding: 20, // Espaçamento interno
    width: '45%', // Ocupa 45% da largura para ter duas colunas com espaçamento
    aspectRatio: 1, // Mantém o card quadrado (largura = altura)
    justifyContent: 'center', // Centraliza o conteúdo do card verticalmente
    alignItems: 'center', // Centraliza o conteúdo do card horizontalmente
    marginBottom: 20, // Margem inferior para separar os cards
    // Sombras para um efeito de profundidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1, // Borda sutil
    borderColor: 'rgba(255, 255, 255, 0.3)', // Cor da borda semi-transparente
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 12,
    color: '#eee', // Cor do texto mais clara
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Fundo semi-transparente
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, // Borda bem arredondada
    marginTop: 30, // Margem superior
    // Sombras
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
