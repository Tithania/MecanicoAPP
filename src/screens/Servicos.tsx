// src/screens/Servicos.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList, // Usaremos FlatList para a lista de serviços
  KeyboardAvoidingView, // Para ajustar o layout com o teclado
  Platform, // Para verificar a plataforma
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
// ALTERAÇÃO: Importa a interface 'Servico' explicitamente como um tipo.
import { addServico, getServicos, deleteServico, type Servicos } from '../database/asyncStorage'; // Importa funções e interface de serviço
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// Define os tipos de parâmetros para as rotas do seu Stack Navigator
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CadastroClient: undefined;
  Servicos: undefined; // Rota para esta tela (agora com tudo)
  Estoque: undefined;
};

export default function Servicos() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Estados para o formulário de cadastro de serviço
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [carro, setCarro] = useState<string>('');
  const [placa, setPlaca] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [ano, setAno] = useState<string>('');

  // Estado para a lista de serviços cadastrados
  const [servicos, setServicos] = useState<Servicos[]>([]);

  // Estado: Controla a visibilidade do formulário de adição/cadastrok
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Efeito para carregar os serviços quando a tela é montada ou focada
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadServicos(); // Recarrega os serviços sempre que a tela for focada
    });
    loadServicos(); // Carrega na montagem inicial
    return unsubscribe; // Limpa o listener ao desmontar
  }, [navigation]);

  /**
   * Carrega a lista de serviços do AsyncStorage e atualiza o estado.
   */
  const loadServicos = async () => {
    const fetchedServicos = await getServicos();
    setServicos(fetchedServicos);
  };

  /**
   * Lida com o salvamento de um novo serviço.
   * Valida os campos e chama a função de adição.
   */
  const handleSaveService = async () => {
    // Validação básica dos campos obrigatórios
    if (!nomeCliente.trim() || !carro.trim() || !placa.trim() || !modelo.trim() || !ano.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      await addServico(nomeCliente, carro, placa, modelo, ano);
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!');
      // Limpa os campos após o cadastro
      setNomeCliente('');
      setCarro('');
      setPlaca('');
      setModelo('');
      setAno('');
      loadServicos(); // Recarrega a lista de serviços para mostrar o novo serviço
      setShowAddForm(false); // Oculta o formulário após adicionar
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o serviço.');
    }
  };

  /**
   * Lida com a exclusão de um serviço.
   * Exibe uma confirmação antes de deletar e recarrega a lista.
   * @param id O ID do serviço a ser deletado.
   */
  const handleDeleteServico = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteServico(id);
              Alert.alert('Sucesso', 'Serviço excluído!');
              loadServicos(); // Recarrega a lista de serviços após deletar
            } catch (err) {
              console.error('Erro ao deletar serviço:', err);
              Alert.alert('Erro', 'Não foi possível excluir o serviço.');
            }
          },
        },
      ]
    );
  };

  // Função para formatar a data para exibição
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR'); // Formato DD/MM/AAAA
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciamento de Serviços</Text>
        </View>

        {/* Botão para alternar a visibilidade do formulário de cadastro */}
        <TouchableOpacity
          style={styles.toggleFormButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.toggleFormButtonText}>
            {showAddForm ? 'Ocultar Formulário de Cadastro' : 'Cadastrar Novo Serviço'}
          </Text>
        </TouchableOpacity>

        {/* Formulário de Cadastro de Serviço (ocultável) */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Cadastrar Novo Serviço</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Cliente"
              placeholderTextColor="#888"
              value={nomeCliente}
              onChangeText={setNomeCliente}
            />
            <TextInput
              style={styles.input}
              placeholder="Carro (Ex: Fiat Palio)"
              placeholderTextColor="#888"
              value={carro}
              onChangeText={setCarro}
            />
            <TextInput
              style={styles.input}
              placeholder="Placa (Ex: ABC-1234)"
              placeholderTextColor="#888"
              value={placa}
              onChangeText={setPlaca}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Modelo (Ex: ELX)"
              placeholderTextColor="#888"
              value={modelo}
              onChangeText={setModelo}
            />
            <TextInput
              style={styles.input}
              placeholder="Ano (Ex: 2010)"
              placeholderTextColor="#888"
              value={ano}
              onChangeText={setAno}
              keyboardType="numeric"
              maxLength={4}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveService}>
              <Text style={styles.buttonText}>Salvar Serviço</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Serviços Cadastrados */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Serviços Cadastrados</Text>
          {servicos.length === 0 ? (
            <Text style={styles.noItemsText}>Nenhum serviço cadastrado.</Text>
          ) : (
            <FlatList
              data={servicos}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.serviceCard}>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceClientName}>Cliente: {item.nomeCliente}</Text>
                    <Text style={styles.serviceInfo}>Carro: {item.carro} ({item.modelo})</Text>
                    <Text style={styles.serviceInfo}>Placa: {item.placa}</Text>
                    <Text style={styles.serviceInfo}>Ano: {item.ano}</Text>
                    <Text style={styles.serviceDate}>Cadastrado em: {formatDate(item.dataCadastro)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteServico(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={servicos.length > 0 ? { paddingBottom: 20 } : {}}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    textAlign: 'center',
  },
  toggleFormButton: {
    backgroundColor: '#6c757d', // Cor cinza para o botão de alternar
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleFormButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff', // Azul para salvar
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    flex: 1, // Permite que a lista ocupe o restante do espaço
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  serviceCard: {
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
  serviceDetails: {
    flex: 1,
  },
  serviceClientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  serviceInfo: {
    fontSize: 14,
    color: '#555',
  },
  serviceDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
