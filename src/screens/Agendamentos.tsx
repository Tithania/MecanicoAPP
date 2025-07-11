import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker'; // Para seleção de data e hora
import { Picker } from '@react-native-picker/picker'; // Para seleção de status
import {
  addAgendamento,
  getAgendamentos,
  deleteAgendamento,
  updateAgendamentoStatus,
  Agendamento,
} from '../database/asyncStorage';

// Define os tipos de parâmetros para as rotas do seu Stack Navigator
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CadastroClient: undefined;
  Servicos: undefined;
  Estoque: undefined;
  Financeiro: undefined;
  Agendamentos: undefined; // Rota para esta tela
};

export default function AgendamentosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Estados para o formulário de agendamento
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [dataHora, setDataHora] = useState<Date>(new Date());
  const [descricao, setDescricao] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  // Estado para a lista de agendamentos
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  // Estado para controlar a visibilidade do formulário de adição
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Usa useFocusEffect para recarregar dados sempre que a tela estiver em foco
  useFocusEffect(
    useCallback(() => {
      loadAgendamentos();
    }, [])
  );

  /**
   * Carrega a lista de agendamentos do AsyncStorage e atualiza o estado.
   */
  const loadAgendamentos = async () => {
    const fetchedAgendamentos = await getAgendamentos();
    setAgendamentos(fetchedAgendamentos);
  };

  /**
   * Lida com a seleção de data no DateTimePicker.
   */
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDataHora(selectedDate);
    }
  };

  /**
   * Lida com a seleção de hora no DateTimePicker.
   */
  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      // Combina a data existente com a nova hora selecionada
      const newDateTime = new Date(dataHora);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDataHora(newDateTime);
    }
  };

  /**
   * Lida com o salvamento de um novo agendamento.
   * Valida os campos e chama a função de adição.
   */
  const handleAddAgendamento = async () => {
    if (!nomeCliente.trim() || !descricao.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome do cliente e a descrição.');
      return;
    }

    try {
      await addAgendamento(nomeCliente, dataHora.toISOString(), descricao);
      Alert.alert('Sucesso', 'Agendamento adicionado!');
      // Limpa os campos após adicionar
      setNomeCliente('');
      setDescricao('');
      setDataHora(new Date()); // Reseta para a data/hora atual
      loadAgendamentos(); // Recarrega a lista de agendamentos
      setShowAddForm(false); // Oculta o formulário após adicionar
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o agendamento.');
    }
  };

  /**
   * Lida com a exclusão de um agendamento.
   */
  const handleDeleteAgendamento = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteAgendamento(id);
              Alert.alert('Sucesso', 'Agendamento excluído!');
              loadAgendamentos(); // Recarrega a lista
            } catch (err) {
              console.error('Erro ao deletar agendamento:', err);
              Alert.alert('Erro', 'Não foi possível excluir o agendamento.');
            }
          },
        },
      ]
    );
  };

  /**
   * Lida com a atualização do status de um agendamento.
   */
  const handleChangeStatus = async (id: string, newStatus: Agendamento['status']) => {
    try {
      await updateAgendamentoStatus(id, newStatus);
      Alert.alert('Sucesso', `Status do agendamento atualizado para: ${newStatus}`);
      loadAgendamentos(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao atualizar status do agendamento:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o status do agendamento.');
    }
  };

  // Função para formatar a data e hora para exibição
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gerenciamento de Agendamentos</Text>
        </View>

        {/* Botão para alternar a visibilidade do formulário de adição */}
        <TouchableOpacity
          style={styles.toggleFormButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.toggleFormButtonText}>
            {showAddForm ? 'Ocultar Formulário de Agendamento' : 'Adicionar Novo Agendamento'}
          </Text>
        </TouchableOpacity>

        {/* Formulário de Adição de Agendamento (ocultável) */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Adicionar Agendamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Cliente"
              placeholderTextColor="#888"
              value={nomeCliente}
              onChangeText={setNomeCliente}
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição do Agendamento (Ex: Troca de óleo)"
              placeholderTextColor="#888"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>
                Selecionar Data: {dataHora.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dataHora}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>
                Selecionar Hora: {dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={dataHora}
                mode="time"
                display="default"
                onChange={onChangeTime}
              />
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddAgendamento}>
              <Text style={styles.buttonText}>Agendar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Agendamentos */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Próximos Agendamentos</Text>
          {agendamentos.length === 0 ? (
            <Text style={styles.noItemsText}>Nenhum agendamento cadastrado.</Text>
          ) : (
            <FlatList
              data={agendamentos.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())} // Ordena por data/hora
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.agendamentoCard}>
                  <View style={styles.agendamentoDetails}>
                    <Text style={styles.agendamentoClientName}>Cliente: {item.nomeCliente}</Text>
                    <Text style={styles.agendamentoInfo}>Descrição: {item.descricao}</Text>
                    <Text style={styles.agendamentoDate}>Quando: {formatDateTime(item.dataHora)}</Text>
                    <Text style={[styles.agendamentoStatus, styles[`status${item.status}`]]}>
                      Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.agendamentoActions}>
                    <Picker
                      selectedValue={item.status}
                      onValueChange={(itemValue) => handleChangeStatus(item.id, itemValue)}
                      style={styles.statusPicker}
                    >
                      <Picker.Item label="Pendente" value="pendente" />
                      <Picker.Item label="Confirmado" value="confirmado" />
                      <Picker.Item label="Concluído" value="concluido" />
                      <Picker.Item label="Cancelado" value="cancelado" />
                    </Picker>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAgendamento(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>X</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              contentContainerStyle={agendamentos.length > 0 ? { paddingBottom: 20 } : {}}
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
    backgroundColor: '#6c757d',
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
  datePickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#28a745',
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
    flex: 1,
    marginBottom: 20,
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
  agendamentoCard: {
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
  agendamentoDetails: {
    flex: 1,
  },
  agendamentoClientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  agendamentoInfo: {
    fontSize: 14,
    color: '#555',
  },
  agendamentoDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  agendamentoStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statuspendente: {
    color: '#ffc107', // Amarelo
  },
  statusconfirmado: {
    color: '#007bff', // Azul
  },
  statusconcluido: {
    color: '#28a745', // Verde
  },
  statuscancelado: {
    color: '#dc3545', // Vermelho
  },
  agendamentoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statusPicker: {
    width: 120, // Ajuste a largura conforme necessário
    height: 40,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
