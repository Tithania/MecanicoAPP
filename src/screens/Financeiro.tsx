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
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker'; // Para seleção de tipo de registro
import {
  addRegistroFinanceiro,
  getRegistrosFinanceiros,
  deleteRegistroFinanceiro,
  updateRegistroFinanceiroStatus,
  RegistroFinanceiro,
  Servicos, // Para buscar nome do serviço se necessário
  getServicos, // Para buscar nome do serviço se necessário
} from '../database/asyncStorage';

// Define os tipos de parâmetros para as rotas do seu Stack Navigator
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  CadastroClient: undefined;
  Servicos: undefined;
  Estoque: undefined;
  Financeiro: undefined; // Rota para esta tela
  Agendamentos: undefined; // Nova rota para agendamentos
};

export default function FinanceiroScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Estados para o formulário de registro financeiro
  const [tipoRegistro, setTipoRegistro] = useState<'receita' | 'despesa'>('receita');
  const [descricao, setDescricao] = useState<string>('');
  const [valor, setValor] = useState<string>('');

  // Estado para a lista de todos os registros financeiros
  const [registros, setRegistros] = useState<RegistroFinanceiro[]>([]);
  // Estado para a lista de serviços a receber (filtrados dos registros)
  const [aReceber, setAReceber] = useState<RegistroFinanceiro[]>([]);

  // Estado para controlar a visibilidade do formulário de adição
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Estados para totais
  const [totalReceitas, setTotalReceitas] = useState<number>(0);
  const [totalDespesas, setTotalDespesas] = useState<number>(0);
  const [lucro, setLucro] = useState<number>(0);
  const [totalAReceber, setTotalAReceber] = useState<number>(0);

  // Usa useFocusEffect para recarregar dados sempre que a tela estiver em foco
  useFocusEffect(
    useCallback(() => {
      loadFinanceiroData();
    }, [])
  );

  /**
   * Carrega todos os dados financeiros e calcula os totais.
   */
  const loadFinanceiroData = async () => {
    const fetchedRegistros = await getRegistrosFinanceiros();
    setRegistros(fetchedRegistros);

    let receitas = 0;
    let despesas = 0;
    let totalPendentes = 0;
    const aReceberList: RegistroFinanceiro[] = [];

    fetchedRegistros.forEach(reg => {
      if (reg.tipo === 'receita') {
        receitas += reg.valor;
      } else if (reg.tipo === 'despesa') {
        despesas += reg.valor;
      } else if (reg.tipo === 'a_receber_servico') {
        if (reg.status === 'pendente') {
          totalPendentes += reg.valor;
          aReceberList.push(reg);
        } else if (reg.status === 'recebido') {
          // Valores de 'a_receber_servico' que foram 'recebidos' já geraram uma 'receita' separada,
          // então não os contamos novamente aqui como receita para evitar duplicidade.
          // A 'receita' já foi adicionada pelo updateRegistroFinanceiroStatus.
        }
      }
    });

    setTotalReceitas(receitas);
    setTotalDespesas(despesas);
    setLucro(receitas - despesas);
    setTotalAReceber(totalPendentes);
    setAReceber(aReceberList);
  };

  /**
   * Lida com o salvamento de um novo registro financeiro (receita ou despesa avulsa).
   */
  const handleAddRegistro = async () => {
    if (!descricao.trim() || !valor.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha a descrição e o valor.');
      return;
    }

    const parsedValor = parseFloat(valor.replace(',', '.'));

    if (isNaN(parsedValor) || parsedValor <= 0) {
      Alert.alert('Valor Inválido', 'Por favor, insira um valor numérico válido e maior que zero.');
      return;
    }

    try {
      await addRegistroFinanceiro(tipoRegistro, descricao, parsedValor);
      Alert.alert('Sucesso', 'Registro adicionado!');
      setDescricao('');
      setValor('');
      loadFinanceiroData(); // Recarrega todos os dados financeiros
      setShowAddForm(false);
    } catch (error) {
      console.error('Erro ao adicionar registro financeiro:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o registro financeiro.');
    }
  };

  /**
   * Lida com a exclusão de qualquer registro financeiro.
   */
  const handleDeleteRegistro = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este registro financeiro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await deleteRegistroFinanceiro(id);
              Alert.alert('Sucesso', 'Registro financeiro excluído!');
              loadFinanceiroData(); // Recarrega todos os dados financeiros
            } catch (err) {
              console.error('Erro ao deletar registro financeiro:', err);
              Alert.alert('Erro', 'Não foi possível excluir o registro financeiro.');
            }
          },
        },
      ]
    );
  };

  /**
   * Marca um registro de "a receber" como pago.
   */
  const handleMarkAsPaid = async (id: string) => {
    Alert.alert(
      'Confirmar Pagamento',
      'Marcar este serviço como pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar como Pago',
          onPress: async () => {
            try {
              await updateRegistroFinanceiroStatus(id, 'recebido');
              Alert.alert('Sucesso', 'Serviço marcado como pago!');
              loadFinanceiroData(); // Recarrega todos os dados financeiros
            } catch (err) {
              console.error('Erro ao marcar como pago:', err);
              Alert.alert('Erro', 'Não foi possível marcar o serviço como pago.');
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
          <Text style={styles.title}>Gerenciamento Financeiro</Text>
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Receitas:</Text>
            <Text style={styles.summaryValueReceita}>R$ {totalReceitas.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Despesas:</Text>
            <Text style={styles.summaryValueDespesa}>R$ {totalDespesas.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Lucro:</Text>
            <Text style={[styles.summaryValueLucro, lucro >= 0 ? styles.lucroPositivo : styles.lucroNegativo]}>
              R$ {lucro.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>A Receber:</Text>
            <Text style={styles.summaryValueAReceber}>R$ {totalAReceber.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        {/* Botão para alternar a visibilidade do formulário de adição */}
        <TouchableOpacity
          style={styles.toggleFormButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.toggleFormButtonText}>
            {showAddForm ? 'Ocultar Formulário de Registro' : 'Adicionar Novo Registro'}
          </Text>
        </TouchableOpacity>

        {/* Formulário de Adição de Registro Financeiro (ocultável) */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Adicionar Receita/Despesa</Text>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tipoRegistro}
                onValueChange={(itemValue) => setTipoRegistro(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Receita" value="receita" />
                <Picker.Item label="Despesa" value="despesa" />
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Descrição (Ex: Venda de Peça, Aluguel)"
              placeholderTextColor="#888"
              value={descricao}
              onChangeText={setDescricao}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor (Ex: 150.75)"
              placeholderTextColor="#888"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddRegistro}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção de Contas a Receber */}
        {aReceber.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Contas a Receber (Serviços)</Text>
            <FlatList
              data={aReceber}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={[styles.registroCard, styles.aReceberCard]}>
                  <View style={styles.registroDetails}>
                    <Text style={styles.registroDescricao}>{item.descricao}</Text>
                    <Text style={styles.registroValor}>R$ {item.valor.toFixed(2).replace('.', ',')}</Text>
                    <Text style={styles.registroData}>Cadastrado em: {formatDate(item.data)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.markAsPaidButton}
                    onPress={() => handleMarkAsPaid(item.id)}
                  >
                    <Text style={styles.markAsPaidButtonText}>Pagar</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
          </View>
        )}

        {/* Lista de Todos os Registros Financeiros */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Histórico Completo</Text>
          {registros.length === 0 ? (
            <Text style={styles.noItemsText}>Nenhum registro financeiro.</Text>
          ) : (
            <FlatList
              data={registros.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())} // Ordena por data mais recente
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={[
                  styles.registroCard,
                  item.tipo === 'receita' ? styles.receitaCard :
                  item.tipo === 'despesa' ? styles.despesaCard :
                  styles.aReceberCard // Estilo para 'a_receber_servico'
                ]}>
                  <View style={styles.registroDetails}>
                    <Text style={styles.registroDescricao}>{item.descricao}</Text>
                    <Text style={[
                        styles.registroValor,
                        item.tipo === 'receita' ? { color: '#28a745' } :
                        item.tipo === 'despesa' ? { color: '#dc3545' } :
                        { color: '#ffc107' } // Cor para 'a_receber_servico'
                    ]}>
                      {item.tipo === 'receita' ? '+' : '-'} R$ {item.valor.toFixed(2).replace('.', ',')}
                      {item.tipo === 'a_receber_servico' && item.status === 'pendente' && ' (Pendente)'}
                      {item.tipo === 'a_receber_servico' && item.status === 'recebido' && ' (Pago)'}
                    </Text>
                    <Text style={styles.registroData}>Data: {formatDate(item.data)}</Text>
                    {item.dataPagamento && item.tipo === 'a_receber_servico' && item.status === 'recebido' && (
                        <Text style={styles.registroData}>Pago em: {formatDate(item.dataPagamento)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRegistro(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={registros.length > 0 ? { paddingBottom: 20 } : {}}
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
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '48%', // Duas colunas
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValueReceita: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745', // Verde
  },
  summaryValueDespesa: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545', // Vermelho
  },
  summaryValueLucro: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lucroPositivo: {
    color: '#28a745', // Verde
  },
  lucroNegativo: {
    color: '#dc3545', // Vermelho
  },
  summaryValueAReceber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffc107', // Amarelo/Laranja
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden', // Garante que o Picker respeite o borderRadius
  },
  picker: {
    height: 50,
    width: '100%',
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
    marginBottom: 20, // Espaçamento inferior para a lista
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
  registroCard: {
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
  receitaCard: {
    borderColor: '#28a745', // Borda verde para receita
    backgroundColor: '#e6ffe6', // Fundo verde claro
  },
  despesaCard: {
    borderColor: '#dc3545', // Borda vermelha para despesa
    backgroundColor: '#ffe6e6', // Fundo vermelho claro
  },
  aReceberCard: {
    borderColor: '#ffc107', // Borda amarela para a receber
    backgroundColor: '#fffbe6', // Fundo amarelo claro
  },
  registroDetails: {
    flex: 1,
  },
  registroDescricao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  registroValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registroData: {
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
  markAsPaidButton: {
    backgroundColor: '#007bff', // Azul para "Pagar"
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  markAsPaidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
