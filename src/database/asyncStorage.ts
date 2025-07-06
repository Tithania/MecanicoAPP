// src/database/asyncStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Usado para feedback de erro simples ao usuário

// Chave única para armazenar nossos clientes no AsyncStorage
const CLIENTES_STORAGE_KEY = '@appMecanico:clientes';
const SERVICOS_STORAGE_KEY = '@appMecanico:servicos';

// Interface para definir a estrutura de um objeto Cliente
export interface Cliente {
  id: string; // Usaremos um ID string único (baseado no timestamp) para simplicidade
  nome: string;
  telefone: string;
  endereco: string;
}

// interface para estrutura do objeto serviço
export interface Servicos {
  id: string;
  nomeCliente: string;
  carro: string;
  placa: string;
  modelo: string;
  ano: string;
  dataCadastro: string; // data registrada do serviço
}

/**
 * Carrega todos os clientes do AsyncStorage.
 *
 * @returns Uma Promise que resolve com um array de objetos Cliente,
 * ou um array vazio se não houver clientes ou ocorrer um erro.
 */
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    // Tenta obter o valor JSON armazenado sob a chave CLIENTES_STORAGE_KEY
    const jsonValue = await AsyncStorage.getItem(CLIENTES_STORAGE_KEY);
    // Se houver dados (jsonValue não é nulo), parseia o JSON de volta para um array de objetos Cliente.
    // Caso contrário, retorna um array vazio.
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // Captura qualquer erro que ocorra durante a leitura do AsyncStorage
    console.error('Erro ao ler clientes do AsyncStorage:', e);
    Alert.alert('Erro de Leitura', 'Não foi possível carregar os clientes.');
    return []; // Em caso de erro, retorna um array vazio para evitar quebrar o aplicativo
  }
};

/**
 * Salva um array de clientes no AsyncStorage.
 * Esta é uma função auxiliar interna, não exportada diretamente para uso externo,
 * pois as operações de adicionar/deletar já a utilizam.
 *
 * @param clientes O array de objetos Cliente a ser salvo.
 * @returns Uma Promise que resolve quando os clientes são salvos com sucesso.
 */
const saveClientes = async (clientes: Cliente[]): Promise<void> => {
  try {
    // Converte o array de clientes para uma string JSON
    const jsonValue = JSON.stringify(clientes);
    // Armazena a string JSON no AsyncStorage sob a chave CLIENTES_STORAGE_KEY
    await AsyncStorage.setItem(CLIENTES_STORAGE_KEY, jsonValue);
  } catch (e) {
    // Captura qualquer erro que ocorra durante a escrita no AsyncStorage
    console.error('Erro ao salvar clientes no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os clientes.');
  }
};

/**
 * Adiciona um novo cliente ao armazenamento.
 *
 * @param nome O nome do cliente.
 * @param telefone O telefone do cliente.
 * @param endereco O endereço do cliente.
 * @returns Uma Promise que resolve quando o cliente é adicionado com sucesso.
 */
export const addCliente = async (
  nome: string,
  telefone: string,
  endereco: string
): Promise<void> => {
  try {
    // Primeiro, obtém a lista atual de clientes
    const clientes = await getClientes();
    // Cria um novo objeto Cliente com um ID único (timestamp atual)
    const newCliente: Cliente = {
      id: String(Date.now()), // Gera um ID único baseado no tempo atual
      nome,
      telefone,
      endereco,
    };
    // Adiciona o novo cliente ao array existente
    clientes.push(newCliente);
    // Salva o array atualizado de volta no AsyncStorage
    await saveClientes(clientes);
    console.log('Cliente adicionado:', newCliente);
  } catch (e) {
    // Captura qualquer erro que ocorra durante o processo de adição
    console.error('Erro ao adicionar cliente:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o cliente.');
  }
};

/**
 * Deleta um cliente do armazenamento pelo seu ID.
 *
 * @param id O ID do cliente a ser deletado.
 * @returns Uma Promise que resolve quando o cliente é deletado com sucesso.
 */
export const deleteCliente = async (id: string): Promise<void> => {
  try {
    // Obtém a lista atual de clientes
    let clientes = await getClientes();
    // Armazena o comprimento inicial do array para verificar se um cliente foi removido
    const initialLength = clientes.length;
    // Filtra o array, removendo o cliente com o ID correspondente
    clientes = clientes.filter(cliente => cliente.id !== id);
    // Se o comprimento do array diminuiu, significa que um cliente foi removido
    if (clientes.length < initialLength) {
      // Salva o array filtrado de volta no AsyncStorage
      await saveClientes(clientes);
      console.log(`Cliente com ID ${id} deletado.`);
    } else {
      console.warn(`Cliente com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    // Captura qualquer erro que ocorra durante o processo de deleção
    console.error('Erro ao deletar cliente:', e);
    Alert.alert('Erro', 'Não foi possível deletar o cliente.');
  }
};

/**
 * Limpa todos os clientes do armazenamento.
 * CUIDADO: Esta função irá remover TODOS os dados de clientes!
 *
 * @returns Uma Promise que resolve quando todos os clientes são removidos.
 */
export const clearAllClientes = async (): Promise<void> => {
  try {
    // Remove o item do AsyncStorage associado à chave CLIENTES_STORAGE_KEY
    await AsyncStorage.removeItem(CLIENTES_STORAGE_KEY);
    console.log('Todos os clientes foram removidos do AsyncStorage.');
  } catch (e) {
    // Captura qualquer erro que ocorra durante a limpeza
    console.error('Erro ao limpar clientes do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os clientes.');
  }
};


// --- Novas Funções para Serviços ---


/**
 * Carrega todos os serviços do AsyncStorage.
 * @returns Uma Promise que resolve com um array de serviços ou um array vazio.
 */
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

/**
 * Salva um array de serviços no AsyncStorage. (Função auxiliar interna)
 */
const saveServicos = async (servicos: Servicos[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(servicos);
    await AsyncStorage.setItem(SERVICOS_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erro ao salvar serviços no AsyncStorage:', e);
    Alert.alert('Erro de Escrita', 'Não foi possível salvar os serviços.');
  }
};

/**
 * Adiciona um novo serviço ao armazenamento.
 * @param servico O objeto Servico a ser adicionado.
 * @returns Uma Promise que resolve quando o serviço é adicionado.
 */
export const addServico = async (
  nomeCliente: string,
  carro: string,
  placa: string,
  modelo: string,
  ano: string
): Promise<void> => {
  try {
    const servicos = await getServicos(); // Pega a lista atual de serviços
    const newServico: Servicos = {
      id: String(Date.now()), // ID único para o serviço
      nomeCliente,
      carro,
      placa,
      modelo,
      ano,
      dataCadastro: new Date().toISOString(), // Data e hora atual do cadastro
    };
    servicos.push(newServico); // Adiciona o novo serviço ao array
    await saveServicos(servicos); // Salva a lista atualizada
    console.log('Serviço adicionado:', newServico);
  } catch (e) {
    console.error('Erro ao adicionar serviço:', e);
    Alert.alert('Erro', 'Não foi possível adicionar o serviço.');
  }
};

/**
 * Deleta um serviço pelo ID.
 * @param id O ID do serviço a ser deletado.
 * @returns Uma Promise que resolve quando o serviço é deletado.
 */
export const deleteServico = async (id: string): Promise<void> => {
  try {
    let servicos = await getServicos();
    const initialLength = servicos.length;
    servicos = servicos.filter(servico => servico.id !== id);
    if (servicos.length < initialLength) {
      await saveServicos(servicos);
      console.log(`Serviço com ID ${id} deletado.`);
    } else {
      console.warn(`Serviço com ID ${id} não encontrado para deletar.`);
    }
  } catch (e) {
    console.error('Erro ao deletar serviço:', e);
    Alert.alert('Erro', 'Não foi possível deletar o serviço.');
  }
};

/**
 * Limpa todos os serviços do armazenamento.
 * CUIDADO: Isso irá apagar todos os dados de serviços!
 */
export const clearAllServicos = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SERVICOS_STORAGE_KEY);
    console.log('Todos os serviços foram removidos do AsyncStorage.');
  } catch (e) {
    console.error('Erro ao limpar serviços do AsyncStorage:', e);
    Alert.alert('Erro', 'Não foi possível limpar os serviços.');
  }
};

