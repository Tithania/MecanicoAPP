import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
// Importa o componente da tela de login
import LoginScreen from './src/screens/LoginScreen';
// Importa as funções e a interface do seu arquivo AsyncStorage
import { getClientes, addCliente, deleteCliente, Cliente, clearAllClientes } from './src/database/asyncStorage';

export default function App() {
  // Estado para controlar se o usuário está logado ou não
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Estados para o gerenciamento de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');

  // Efeito para carregar os clientes quando o usuário está logado e o componente é montado/atualizado
  // Este useEffect será executado apenas quando isLoggedIn mudar para true
  useEffect(() => {
    if (isLoggedIn) {
      loadClientes();
    }
  }, [isLoggedIn]); // Depende do estado isLoggedIn

  // Função que é chamada pela LoginScreen quando o login é bem-sucedido
  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Muda o estado para 'logado'
  };

  // Função para carregar os clientes do AsyncStorage
  const loadClientes = async () => {
    const fetchedClientes = await getClientes();
    setClientes(fetchedClientes);
  };

  // Função para adicionar um novo cliente
  const handleAddCliente = async () => {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert('Campos Obrigatórios', 'Nome e Telefone são obrigatórios.');
      return;
    }
    await addCliente(nome, telefone, endereco);
    Alert.alert('Sucesso', 'Cliente adicionado!');
    // Limpa os campos após adicionar
    setNome('');
    setTelefone('');
    setEndereco('');
    loadClientes(); // Recarrega a lista de clientes
  };

  // Função para deletar um cliente
  const handleDeleteCliente = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            await deleteCliente(id);
            Alert.alert('Sucesso', 'Cliente excluído!');
            loadClientes(); // Recarrega a lista de clientes
          },
        },
      ]
    );
  };

  // Função para limpar todos os clientes (útil para testes)
  const handleClearAllClientes = async () => {
    Alert.alert(
      'Confirmar Limpeza',
      'Isso irá apagar TODOS os clientes. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          onPress: async () => {
            await clearAllClientes();
            Alert.alert('Sucesso', 'Todos os clientes foram removidos!');
            loadClientes(); // Recarrega a lista (que estará vazia)
          },
        },
      ]
    );
  };

  // Renderização condicional:
  // Se isLoggedIn for falso, mostra a tela de login
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Se isLoggedIn for verdadeiro, mostra a interface de gerenciamento de clientes
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciador de Clientes</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome do Cliente"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone do Cliente"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Endereço do Cliente (Opcional)"
          value={endereco}
          onChangeText={setEndereco}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddCliente}>
          <Text style={styles.buttonText}>Adicionar Cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAllClientes}>
          <Text style={styles.buttonText}>Limpar Todos os Clientes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Lista de Clientes</Text>
        {clientes.length === 0 ? (
          <Text style={styles.noClientsText}>Nenhum cliente cadastrado.</Text>
        ) : (
          <FlatList
            data={clientes}
            keyExtractor={item => item.id} // keyExtractor usa o ID do cliente
            renderItem={({ item }) => (
              <View style={styles.clienteItem}>
                <View>
                  <Text style={styles.clienteNome}>{item.nome}</Text>
                  <Text style={styles.clienteInfo}>Telefone: {item.telefone}</Text>
                  {item.endereco ? (
                    <Text style={styles.clienteInfo}>Endereço: {item.endereco}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCliente(item.id)}
                >
                  <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 40,
  },
  header: {
    backgroundColor: '#007bff',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#ffc107', // Cor amarela para o botão de limpar
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  noClientsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  clienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clienteInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
