import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView, // Para permitir rolagem se o conteúdo for grande
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { addServico } from '../database/asyncStorage'; // Importa a função para adicionar serviço

// Define os tipos de parâmetros para as rotas do seu Stack Navigator
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CadastroClient: undefined;
  Servicos: undefined; // Adiciona a rota de Cadastro de Serviços
  // Adicione outras rotas aqui se tiver mais telas
};

export default function Servicos() { // Nome do componente atualizado
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Estados para os campos do formulário de serviço
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [carro, setCarro] = useState<string>('');
  const [placa, setPlaca] = useState<string>('');
  const [modelo, setModelo] = useState<string>('');
  const [ano, setAno] = useState<string>('');

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
      // Chama a função para adicionar o serviço ao AsyncStorage
      await addServico(nomeCliente, carro, placa, modelo, ano);
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!');
      // Limpa os campos após o cadastro
      setNomeCliente('');
      setCarro('');
      setPlaca('');
      setModelo('');
      setAno('');
      // Opcional: navegar de volta para o Dashboard ou para uma lista de serviços
      navigation.goBack(); // Volta para a tela anterior (Dashboard)
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o serviço.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cadastro de Serviços</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do Cliente"
          value={nomeCliente}
          onChangeText={setNomeCliente}
        />
        <TextInput
          style={styles.input}
          placeholder="Carro (Ex: Fiat Palio)"
          value={carro}
          onChangeText={setCarro}
        />
        <TextInput
          style={styles.input}
          placeholder="Placa (Ex: ABC-1234)"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters" // Capitaliza letras para placas
        />
        <TextInput
          style={styles.input}
          placeholder="Modelo (Ex: ELX)"
          value={modelo}
          onChangeText={setModelo}
        />
        <TextInput
          style={styles.input}
          placeholder="Ano (Ex: 2010)"
          value={ano}
          onChangeText={setAno}
          keyboardType="numeric" // Teclado numérico para o ano
          maxLength={4} // Limita o ano a 4 dígitos
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveService}>
          <Text style={styles.buttonText}>Salvar Serviço</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
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
    backgroundColor: '#007bff',
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
  backButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6c757d', // Cor cinza para o botão de voltar
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
});
