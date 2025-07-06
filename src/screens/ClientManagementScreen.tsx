// src/screens/ClientManagementScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert, // Usado para exibir alertas ao usuário
  TextInput,
} from 'react-native';
// Importa as funções e a interface do seu arquivo de gerenciamento de dados (AsyncStorage)
import { getClientes, addCliente, deleteCliente, Cliente, clearAllClientes } from '../database/asyncStorage';

export default function ClientManagementScreen() {
  // Estados para gerenciar os dados do formulário de cliente
  const [clientes, setClientes] = useState<Cliente[]>([]); // Lista de clientes carregados
  const [nome, setNome] = useState<string>(''); // Nome do cliente no input
  const [telefone, setTelefone] = useState<string>(''); // Telefone do cliente no input
  const [endereco, setEndereco] = useState<string>(''); // Endereço do cliente no input

  // Efeito que é executado uma vez quando o componente é montado
  // para carregar a lista inicial de clientes.
  useEffect(() => {
    loadClientes();
  }, []);

  /**
   * Carrega a lista de clientes do AsyncStorage e atualiza o estado.
   */
  const loadClientes = async () => {
    const fetchedClientes = await getClientes();
    setClientes(fetchedClientes);
  };

  /**
   * Lida com a adição de um novo cliente.
   * Valida os campos, adiciona o cliente e recarrega a lista.
   */
  const handleAddCliente = async () => {
    // Validação básica: nome e telefone são obrigatórios
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert('Campos Obrigatórios', 'Nome e Telefone são obrigatórios.');
      return;
    }
    try {
      // Chama a função para adicionar o cliente ao AsyncStorage
      await addCliente(nome, telefone, endereco);
      Alert.alert('Sucesso', 'Cliente adicionado!');
      // Limpa os campos do formulário após adicionar
      setNome('');
      setTelefone('');
      setEndereco('');
      loadClientes(); // Recarrega a lista de clientes para mostrar o novo cliente
    } catch (err) {
      console.error('Erro ao adicionar cliente:', err);
      Alert.alert('Erro', 'Não foi possível adicionar o cliente.');
    }
  };

  /**
   * Lida com a exclusão de um cliente.
   * Exibe uma confirmação antes de deletar e recarrega a lista.
   * @param id O ID do cliente a ser deletado.
   */
  const handleDeleteCliente = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' }, // Botão de cancelar
        {
          text: 'Excluir', // Botão de confirmar exclusão
          onPress: async () => {
            try {
              // Chama a função para deletar o cliente do AsyncStorage
              await deleteCliente(id);
              Alert.alert('Sucesso', 'Cliente excluído!');
              loadClientes(); // Recarrega a lista de clientes após deletar
            } catch (err) {
              console.error('Erro ao deletar cliente:', err);
              Alert.alert('Erro', 'Não foi possível excluir o cliente.');
            }
          },
        },
      ]
    );
  };

  /**
   * Lida com a limpeza de todos os clientes.
   * Exibe uma confirmação antes de limpar e recarrega a lista (que ficará vazia).
   */
  const handleClearAllClientes = async () => {
    Alert.alert(
      'Confirmar Limpeza',
      'Isso irá apagar TODOS os clientes. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          onPress: async () => {
            try {
              // Chama a função para limpar todos os clientes do AsyncStorage
              await clearAllClientes();
              Alert.alert('Sucesso', 'Todos os clientes foram removidos!');
              loadClientes(); // Recarrega a lista (que estará vazia)
            } catch (err) {
              console.error('Erro ao limpar clientes do AsyncStorage:', err);
              Alert.alert('Erro', 'Não foi possível limpar os clientes.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciador de Clientes</Text>
      </View>

      {/* Formulário para adicionar novos clientes */}
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
          keyboardType="phone-pad" // Teclado numérico para telefone
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

      {/* Lista de Clientes */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Lista de Clientes</Text>
        {clientes.length === 0 ? (
          <Text style={styles.noClientsText}>Nenhum cliente cadastrado.</Text>
        ) : (
          <FlatList
            data={clientes} // Dados a serem renderizados
            keyExtractor={item => item.id} // Função para extrair uma chave única para cada item
            renderItem={({ item }) => ( // Função para renderizar cada item da lista
              <View style={styles.clienteItem}>
                <View>
                  <Text style={styles.clienteNome}>{item.nome}</Text>
                  <Text style={styles.clienteInfo}>Telefone: {item.telefone}</Text>
                  {item.endereco ? ( // Renderiza o endereço apenas se ele existir
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

// Estilos para os componentes da tela de Gerenciamento de Clientes
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Cor de fundo geral
    paddingTop: 40, // Espaçamento superior para a barra de status
  },
  header: {
    backgroundColor: '#007bff', // Cor de fundo do cabeçalho
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    // Sombras para o cabeçalho
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // Cor do texto do título
  },
  formContainer: {
    backgroundColor: '#fff', // Cor de fundo do container do formulário
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    // Sombras para o formulário
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
    backgroundColor: '#28a745', // Cor verde para o botão de adicionar
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
    backgroundColor: '#fff', // Cor de fundo do container da lista
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    // Sombras para a lista
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
    backgroundColor: '#f8f9fa', // Cor de fundo de cada item da lista
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
    backgroundColor: '#dc3545', // Cor vermelha para o botão de deletar
    width: 30,
    height: 30,
    borderRadius: 15, // Torna o botão circular
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
