import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView, // componente para ajustar layout com teclado
  Platform, //verificar plataforma IOS e android
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addEstoqueItem, getEstoqueItems, deleteEstoqueItem, EstoqueItem } from '../database/asyncStorage';

// Define os tipos de parâmetros para as rotas do seu Stack Navigator
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CadastroClient: undefined;
  Servicos: undefined;
  ServiceList: undefined;
  Estoque: undefined; // Adiciona a rota de Estoque
};

export default function EstoqueScreen() { // Nome do componente
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Estados para o formulário de adição de item de estoque
  const [nomeItem, setNomeItem] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>(''); // Usar string para input, converter para number
  const [precoUnitario, setPrecoUnitario] = useState<string>(''); // Usar string para input, converter para number

  // Estado para a lista de itens de estoque
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);

  // Efeito para carregar os itens de estoque quando a tela é montada ou focada
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEstoqueItems(); // Recarrega os itens sempre que a tela for focada
    });

    loadEstoqueItems(); // Carrega na montagem inicial
    return unsubscribe; // Limpa o listener ao desmontar
  }, [navigation]); // Adiciona navigation como dependência para o listener

  /**
   * Carrega a lista de itens de estoque do AsyncStorage e atualiza o estado.
   */
  const loadEstoqueItems = async () => {
    const fetchedItems = await getEstoqueItems();
    setEstoqueItems(fetchedItems);
  };

  /**
   * Lida com o salvamento de um novo item de estoque.
   * Valida os campos e chama a função de adição.
   */
  const handleAddItem = async () => {
    // Validação básica dos campos
    if (!nomeItem.trim() || !quantidade.trim() || !precoUnitario.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    const parsedQuantidade = parseInt(quantidade, 10);
    const parsedPrecoUnitario = parseFloat(precoUnitario.replace(',', '.')); // Lida com vírgula como separador decimal

    if (isNaN(parsedQuantidade) || parsedQuantidade <= 0) {
      Alert.alert('Quantidade Inválida', 'Por favor, insira uma quantidade numérica válida e maior que zero.');
      return;
    }
    if (isNaN(parsedPrecoUnitario) || parsedPrecoUnitario < 0) {
      Alert.alert('Preço Inválido', 'Por favor, insira um preço unitário numérico válido.');
      return;
    }

    try {
      await addEstoqueItem(nomeItem, parsedQuantidade, parsedPrecoUnitario);
      Alert.alert('Sucesso', 'Item adicionado ao estoque!');
      // Limpa os campos após adicionar
      setNomeItem('');
      setQuantidade('');
      setPrecoUnitario('');
      loadEstoqueItems(); // Recarrega a lista de itens
    } catch (error) {
      console.error('Erro ao adicionar item de estoque:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o item ao estoque.');
    }
  };

  /**
   * Lida com a exclusão de um item de estoque.
   * Exibe uma confirmação antes de deletar e recarrega a lista.
   * @param id O ID do item a ser deletado.
   */
  const handleDeleteItem = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este item do estoque?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteEstoqueItem(id);
              Alert.alert('Sucesso', 'Item excluído do estoque!');
              loadEstoqueItems(); // Recarrega a lista
            } catch (err) {
              console.error('Erro ao deletar item de estoque:', err);
              Alert.alert('Erro', 'Não foi possível excluir o item do estoque.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/*ALTERACAO KEYBOARD SUBISTITUIR SCROLLVIEW */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Ajusta o comportamento para iOS/Android
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciamento de Estoque</Text>
        </View>

        {/* Formulário para adicionar item - ESSA PARTE NAO ROLA*/}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Adicionar Novo Item</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do Item"
            value={nomeItem}
            onChangeText={setNomeItem}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Preço Unitário (Ex: 12.50)"
            value={precoUnitario}
            onChangeText={setPrecoUnitario}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.buttonText}>Adicionar Item</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Itens no Estoque - ALERACAO FLATLIST GERENCIA A PROPRIA ROLAGEM O CONTEINER AGORA TEM FLEX */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Itens em Estoque</Text>
          {estoqueItems.length === 0 ? (
            <Text style={styles.noItemsText}>Nenhum item no estoque.</Text>
          ) : (
            <FlatList
              data={estoqueItems}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemCard}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.nome}</Text>
                    <Text style={styles.itemInfo}>Quantidade: {item.quantidade}</Text>
                    <Text style={styles.itemInfo}>Preço Unitário: R$ {item.precoUnitario.toFixed(2).replace('.', ',')}</Text>
                    <Text style={styles.itemDate}>Entrada: {new Date(item.dataEntrada).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              )}
              //ESPACAMENTO PARA ULTIMO ITEM DA LISTA
              contentContainerStyle={estoqueItems.length > 0 ? {paddingBottom: 20} :{}}
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
  keyboardAvoidingView: { // NOVO ESTILO: Garante que o KeyboardAvoidingView ocupe todo o espaço
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
  addButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#28a745', // Verde para adicionar
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
    flex: 1, // ALTERAÇÃO: Permite que a lista ocupe o restante do espaço disponível
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
  itemCard: {
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
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemInfo: {
    fontSize: 14,
    color: '#555',
  },
  itemDate: {
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
