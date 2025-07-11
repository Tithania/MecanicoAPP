import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Chaves únicas para armazenar nossos dados no AsyncStorage
const CLIENTES_STORAGE_KEY = '@appMecanico:clientes';
const SERVICOS_STORAGE_KEY = '@appMecanico:servicos';
const ESTOQUE_STORAGE_KEY = '@appMecanico:estoque';
const FINANCEIRO_STORAGE_KEY = '@appMecanico:financeiro';
const AGENDAMENTOS_STORAGE_KEY = '@appMecanico:agendamentos'; // Nova chave para agendamentos

// Interface para definir a estrutura de um objeto Cliente
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
}

// Interface para definir a estrutura de um objeto Serviço
export interface Servicos {
  id: string;
  nomeCliente: string;
  carro: string;
  placa: string;
  modelo: string;
  ano: string;
  dataCadastro: string;
}

// Interface para definir a estrutura de um objeto Item de Estoque
export interface EstoqueItem {
  id: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  dataEntrada: string;
}

// NOVA INTERFACE: Para definir a estrutura de um Registro Financeiro
export interface RegistroFinanceiro {
  id: string;
  tipo: 'receita' | 'despesa' | 'a_receber_servico'; // Tipos de registro financeiro
  descricao: string;
  valor: number;
  data: string; // Data do registro
  // Campos opcionais para registros de serviço a receber
  status?: 'pendente' | 'recebido'; // Status para 'a_receber_servico'
  servicoId?: string; // ID do serviço que gerou este 'a_receber_servico'
  dataPagamento?: string; // Data em que o 'a_receber_servico' foi pago
}

// NOVA INTERFACE: Para definir a estrutura de um Agendamento
export interface Agendamento {
  id: string;
  nomeCliente: string;
  dataHora: string; // Data e hora do agendamento (ISO string)
  descricao: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
}

// --- Funções para Clientes ---

export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CLIENTES_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao ler clientes do AsyncStorage:', e);
    Alert.alert('Erro de Leitura', 'Não foi possível carregar os clientes.');
    return [];
  }
};

const saveClientes = async (clientes: Cliente[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(clientes);
    await AsyncStorage.setItem(CLIENTES_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erro ao salvar clientes no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os clientes.');
  }
};

export const addCliente = async (
  nome: string,
  telefone: string,
  endereco: string
): Promise<void> => {
  try {
    const clientes = await getClientes();
    const newCliente: Cliente = {
      id: String(Date.now()),
      nome,
      telefone,
      endereco,
    };
    clientes.push(newCliente);
    await saveClientes(clientes);
    console.log('Cliente adicionado:', newCliente);
  } catch (e) {
    console.error('Erro ao adicionar cliente:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o cliente.');
  }
};

export const deleteCliente = async (id: string): Promise<void> => {
  try {
    let clientes = await getClientes();
    const initialLength = clientes.length;
    clientes = clientes.filter(cliente => cliente.id !== id);
    if (clientes.length < initialLength) {
      await saveClientes(clientes);
      console.log(`Cliente com ID ${id} deletado.`);
    } else {
      console.warn(`Cliente com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    console.error('Erro ao deletar cliente:', e);
    Alert.alert('Erro', 'Não foi possível deletar o cliente.');
  }
};

export const clearAllClientes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CLIENTES_STORAGE_KEY);
    console.log('Todos os clientes foram removidos do AsyncStorage.');
  } catch (e) {
    console.error('Erro ao limpar clientes do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os clientes.');
  }
};

// --- Funções para Serviços ---

export const getServicos = async (): Promise<Servicos[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SERVICOS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao ler serviços do AsyncStorage:', e);
    Alert.alert('Erro de Leitura', 'Não foi possível carregar os serviços.');
    return [];
  }
};

const saveServicos = async (servicos: Servicos[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(servicos);
    await AsyncStorage.setItem(SERVICOS_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erro ao salvar serviços no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os serviços.');
  }
};

export const addServico = async (
  nomeCliente: string,
  carro: string,
  placa: string,
  modelo: string,
  ano: string,
  valorServico?: number // Opcional: valor do serviço para gerar 'a_receber'
): Promise<void> => {
  try {
    const servicos = await getServicos();
    const newServico: Servicos = {
      id: String(Date.now()),
      nomeCliente,
      carro,
      placa,
      modelo,
      ano,
      dataCadastro: new Date().toISOString(),
    };
    servicos.push(newServico);
    await saveServicos(servicos);
    console.log('Serviço adicionado:', newServico);

    // Se um valor de serviço for fornecido, cria um registro de "a receber"
    if (valorServico && valorServico > 0) {
      await addRegistroFinanceiro(
        'a_receber_servico',
        `Serviço para ${nomeCliente} (${carro} - ${placa})`,
        valorServico,
        newServico.id, // Vincula ao ID do serviço
        'pendente'
      );
      console.log('Registro de serviço a receber adicionado.');
    }

  } catch (e) {
    console.error('Erro ao adicionar serviço:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o serviço.');
  }
};

export const deleteServico = async (id: string): Promise<void> => {
  try {
    let servicos = await getServicos();
    const initialLength = servicos.length;
    servicos = servicos.filter(servico => servico.id !== id);
    if (servicos.length < initialLength) {
      await saveServicos(servicos);
      console.log(`Serviço com ID ${id} deletado.`);
      // Opcional: remover registros financeiros associados a este serviço
      // Isso seria mais complexo e exigiria uma lógica para identificar e remover.
      // Por enquanto, vamos manter simples.
    } else {
      console.warn(`Serviço com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    console.error('Erro ao deletar serviço:', e);
    Alert.alert('Erro', 'Não foi possível deletar o serviço.');
  }
};

export const clearAllServicos = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SERVICOS_STORAGE_KEY);
    console.log('Todos os serviços foram removidos do AsyncStorage.');
  } catch (e) {
    console.error('Erro ao limpar serviços do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os serviços.');
  }
};

// --- Funções para Estoque ---

export const getEstoqueItems = async (): Promise<EstoqueItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ESTOQUE_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao ler itens de estoque do AsyncStorage:', e);
    Alert.alert('Erro de Leitura', 'Não foi possível carregar os itens de estoque.');
    return [];
  }
};

const saveEstoqueItems = async (items: EstoqueItem[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(ESTOQUE_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erro ao salvar itens de estoque no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os itens de estoque.');
  }
};

export const addEstoqueItem = async (
  nome: string,
  quantidade: number,
  precoUnitario: number
): Promise<void> => {
  try {
    const items = await getEstoqueItems();
    const newItem: EstoqueItem = {
      id: String(Date.now()),
      nome,
      quantidade,
      precoUnitario,
      dataEntrada: new Date().toISOString(),
    };
    items.push(newItem);
    await saveEstoqueItems(items);
    console.log('Item de estoque adicionado:', newItem);
  } catch (e) {
    console.error('Erro ao adicionar item de estoque:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o item de estoque.');
  }
};

export const deleteEstoqueItem = async (id: string): Promise<void> => {
  try {
    let items = await getEstoqueItems();
    const initialLength = items.length;
    items = items.filter(item => item.id !== id);
    if (items.length < initialLength) {
      await saveEstoqueItems(items);
      console.log(`Item de estoque com ID ${id} deletado.`);
    } else {
      console.warn(`Item de estoque com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    console.error('Erro ao deletar item de estoque:', e);
    Alert.alert('Erro', 'Não foi possível deletar o item de estoque.');
  }
};

export const clearAllEstoqueItems = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ESTOQUE_STORAGE_KEY);
    console.log('Todos os itens de estoque foram removidos do AsyncStorage.');
  } catch (e) {
    console.error('Erro ao limpar itens de estoque do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os itens de estoque.');
  }
};

// --- Funções para Financeiro ---

export const getRegistrosFinanceiros = async (): Promise<RegistroFinanceiro[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(FINANCEIRO_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao ler registros financeiros do AsyncStorage:', e);
    Alert.alert('Erro de Leitura', 'Não foi possível carregar os registros financeiros.');
    return [];
  }
};

const saveRegistrosFinanceiros = async (registros: RegistroFinanceiro[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(registros);
    await AsyncStorage.setItem(FINANCEIRO_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erro ao salvar registros financeiros no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os registros financeiros.');
  }
};

export const addRegistroFinanceiro = async (
  tipo: 'receita' | 'despesa' | 'a_receber_servico',
  descricao: string,
  valor: number,
  servicoId?: string, // Opcional: para vincular a um serviço
  status?: 'pendente' | 'recebido' // Opcional: para 'a_receber_servico'
): Promise<void> => {
  try {
    const registros = await getRegistrosFinanceiros();
    const newRegistro: RegistroFinanceiro = {
      id: String(Date.now()),
      tipo,
      descricao,
      valor,
      data: new Date().toISOString(),
      servicoId, // Adiciona servicoId se fornecido
      status,    // Adiciona status se fornecido
    };
    registros.push(newRegistro);
    await saveRegistrosFinanceiros(registros);
    console.log('Registro financeiro adicionado:', newRegistro);
  } catch (e) {
    console.error('Erro ao adicionar registro financeiro:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o registro financeiro.');
  }
};

export const updateRegistroFinanceiroStatus = async (
  id: string,
  newStatus: 'pendente' | 'recebido'
): Promise<void> => {
  try {
    let registros = await getRegistrosFinanceiros();
    const index = registros.findIndex(reg => reg.id === id);

    if (index !== -1) {
      if (registros[index].tipo === 'a_receber_servico') {
        registros[index].status = newStatus;
        if (newStatus === 'recebido') {
          registros[index].dataPagamento = new Date().toISOString();
          // Opcional: Adicionar o valor como receita real após o pagamento
          await addRegistroFinanceiro('receita', `Pagamento de ${registros[index].descricao}`, registros[index].valor);
          console.log(`Registro financeiro ${id} atualizado para 'recebido' e receita gerada.`);
        }
        await saveRegistrosFinanceiros(registros);
        console.log(`Registro financeiro com ID ${id} atualizado para status: ${newStatus}.`);
      } else {
        console.warn(`Registro ${id} não é do tipo 'a_receber_servico', status não atualizado.`);
        Alert.alert('Aviso', 'Este registro não é um serviço a receber e não pode ter o status atualizado.');
      }
    } else {
      console.warn(`Registro financeiro com ID ${id} não encontrado para atualizar.`);
      Alert.alert('Erro', 'Registro financeiro não encontrado.');
    }
  } catch (e) {
    console.error('Erro ao atualizar status do registro financeiro:', e);
    Alert.alert('Erro', 'Não foi possível atualizar o status do registro financeiro.');
  }
};


export const deleteRegistroFinanceiro = async (id: string): Promise<void> => {
  try {
    let registros = await getRegistrosFinanceiros();
    const initialLength = registros.length;
    registros = registros.filter(registro => registro.id !== id);
    if (registros.length < initialLength) {
      await saveRegistrosFinanceiros(registros);
      console.log(`Registro financeiro com ID ${id} deletado.`);
    } else {
      console.warn(`Registro financeiro com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    console.error('Erro ao deletar registro financeiro:', e);
    Alert.alert('Erro', 'Não foi possível deletar o registro financeiro.');
  }
};

export const clearAllRegistrosFinanceiros = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FINANCEIRO_STORAGE_KEY);
    console.log('Todos os registros financeiros foram removidos do AsyncStorage.');
  } catch (e) {
    console.error('Erro ao limpar registros financeiros do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os registros financeiros.');
  }
};

// --- Funções para Agendamentos ---

export const getAgendamentos = async (): Promise<Agendamento[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao ler agendamentos do AsyncStorage:', e);
    Alert.alert('Erro de Leitura', 'Não foi possível carregar os agendamentos.');
    return [];
  }
};

const saveAgendamentos = async (agendamentos: Agendamento[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(agendamentos);
    await AsyncStorage.setItem(AGENDAMENTOS_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erro ao salvar agendamentos no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os agendamentos.');
  }
};

export const addAgendamento = async (
  nomeCliente: string,
  dataHora: string,
  descricao: string
): Promise<void> => {
  try {
    const agendamentos = await getAgendamentos();
    const newAgendamento: Agendamento = {
      id: String(Date.now()),
      nomeCliente,
      dataHora,
      descricao,
      status: 'pendente', // Status inicial
    };
    agendamentos.push(newAgendamento);
    await saveAgendamentos(agendamentos);
    console.log('Agendamento adicionado:', newAgendamento);
  } catch (e) {
    console.error('Erro ao adicionar agendamento:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o agendamento.');
  }
};

export const updateAgendamentoStatus = async (
  id: string,
  newStatus: 'pendente' | 'confirmado' | 'concluido' | 'cancelado'
): Promise<void> => {
  try {
    let agendamentos = await getAgendamentos();
    const index = agendamentos.findIndex(ag => ag.id === id);

    if (index !== -1) {
      agendamentos[index].status = newStatus;
      await saveAgendamentos(agendamentos);
      console.log(`Agendamento com ID ${id} atualizado para status: ${newStatus}.`);
    } else {
      console.warn(`Agendamento com ID ${id} não encontrado para atualizar.`);
      Alert.alert('Erro', 'Agendamento não encontrado.');
    }
  } catch (e) {
    console.error('Erro ao atualizar status do agendamento:', e);
    Alert.alert('Erro', 'Não foi possível atualizar o status do agendamento.');
  }
};

export const deleteAgendamento = async (id: string): Promise<void> => {
  try {
    let agendamentos = await getAgendamentos();
    const initialLength = agendamentos.length;
    agendamentos = agendamentos.filter(agendamento => agendamento.id !== id);
    if (agendamentos.length < initialLength) {
      await saveAgendamentos(agendamentos);
      console.log(`Agendamento com ID ${id} deletado.`);
    } else {
      console.warn(`Agendamento com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    console.error('Erro ao deletar agendamento:', e);
    Alert.alert('Erro', 'Não foi possível deletar o agendamento.');
  }
};

export const clearAllAgendamentos = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AGENDAMENTOS_STORAGE_KEY);
    console.log('Todos os agendamentos foram removidos do AsyncStorage.');
  } catch (e) {
    console.error('Erro ao limpar agendamentos do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os agendamentos.');
  }
};
