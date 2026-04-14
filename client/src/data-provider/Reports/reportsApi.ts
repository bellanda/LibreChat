import { REPORT_CONFIG } from '../../store/reports';

const fetchUsageCostData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    // Adiciona filtros como parâmetros da URL
    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username'); // ou 'name' dependendo do que você quer buscar
    }

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Se não especificar data final, força incluir data atual para garantir dados de hoje
      const today = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
      params.append('end_date', today);
      console.log('[DEBUG] Aplicando data final padrão para incluir hoje:', today);
    }

    const url = `${REPORT_CONFIG.URL_BASE}${REPORT_CONFIG.ENDPOINTS.USAGE_COST}${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para:', url);

    // Primeiro testa se a rota existe
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);

      // Se for 404, significa que a rota não existe
      if (response.status === 404) {
        console.warn('[DEBUG] Rota não encontrada - verificar se API Python está rodando');
      }

      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('[DEBUG] Resposta não é JSON:', responseText);
      throw new Error('Resposta da API não é JSON válido');
    }

    const data = await response.json();
    console.log('[DEBUG] Dados brutos da API:', data);

    // Mapeia dados da API (nomes antigos) para novos nomes se necessário
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      console.log('[DEBUG] Campos recebidos da API:', Object.keys(firstItem));

      // Verifica se já tem formato novo (QUESTIONS/ANSWERS)
      const hasNewFormat = [
        'QUESTIONS',
        'QUESTIONS custo',
        'ANSWERS',
        'ANSWERS custo',
        'date',
      ].every((field) => firstItem.hasOwnProperty(field));

      if (hasNewFormat) {
        console.log('[DEBUG] ✅ Dados já têm formato correto (QUESTIONS/ANSWERS)');
        return data;
      }

      // Verifica se tem formato antigo (IA msgs/USER msgs) e mapeia
      const hasOldFormat = ['IA msgs', 'IA custo', 'USER msgs', 'USER custo', 'date'].every(
        (field) => firstItem.hasOwnProperty(field),
      );

      if (hasOldFormat) {
        console.log('[DEBUG] 🔄 Convertendo dados do formato antigo para novo...');
        const mappedData = data.map((item) => ({
          date: item.date,
          QUESTIONS: item['USER msgs'], // USER msgs → QUESTIONS
          'QUESTIONS custo': item['USER custo'], // USER custo → QUESTIONS custo
          ANSWERS: item['IA msgs'], // IA msgs → ANSWERS
          'ANSWERS custo': item['IA custo'], // IA custo → ANSWERS custo
        }));
        console.log('[DEBUG] ✅ Dados convertidos com sucesso:', mappedData);
        return mappedData;
      }

      console.warn(
        '[DEBUG] ⚠️ Dados não têm formato esperado (nem antigo nem novo). Campos encontrados:',
        Object.keys(firstItem),
      );
      return [];
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de uso e custo:', error);

    // Se for erro de rede, mostrar mensagem específica
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.warn('[DEBUG] Erro de rede - API pode estar offline');
    }

    // Retorna dados mock como fallback
    return [];
  }
};

const fetchTopUsersVolumeData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Se não especificar data final, força incluir data atual para garantir dados de hoje
      const today = new Date().toISOString().split('T')[0];
      params.append('end_date', today);
      console.log('[DEBUG] Top Users Volume - Aplicando data final padrão:', today);
    }

    // Se limit está presente nos filtros, usa o valor (mesmo que seja null)
    // Se não está presente, usa 10 como padrão
    const limit = 'limit' in filters ? filters.limit : 10;
    // 🔧 CORREÇÃO: Tratamento explícito de limit null vs undefined
    if (limit !== undefined) {
      if (limit === null) {
        // Quando limit é null, NÃO enviamos o parâmetro para que o backend use None
        console.log('[DEBUG] ✅ SEM LIMIT - buscando todos os dados');
      } else {
        // Quando limit tem valor, enviamos normalmente
        params.append('limit', limit.toString());
        console.log('[DEBUG] Enviando limit:', limit);
      }
    }

    const url = `${REPORT_CONFIG.URL_BASE}${REPORT_CONFIG.ENDPOINTS.TOP_USERS_VOLUME}${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Users Volume:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Dados Top Users Volume recebidos:', data);

    return data;
  } catch (error) {
    console.error('Erro ao buscar top users volume:', error);
    return [];
  }
};

const fetchTopUsersCostData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Se não especificar data final, força incluir data atual para garantir dados de hoje
      const today = new Date().toISOString().split('T')[0];
      params.append('end_date', today);
      console.log('[DEBUG] Top Users Cost - Aplicando data final padrão:', today);
    }

    // Se limit está presente nos filtros, usa o valor (mesmo que seja null)
    // Se não está presente, usa 10 como padrão
    const limit = 'limit' in filters ? filters.limit : 10;
    // 🔧 CORREÇÃO: Tratamento explícito de limit null vs undefined
    if (limit !== undefined) {
      if (limit === null) {
        console.log('[DEBUG] ✅ SEM LIMIT - buscando todos os dados');
      } else {
        params.append('limit', limit.toString());
        console.log('[DEBUG] Enviando limit:', limit);
      }
    }

    const url = `${REPORT_CONFIG.URL_BASE}${REPORT_CONFIG.ENDPOINTS.TOP_USERS_COST}${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Users Cost:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Dados Top Users Cost recebidos:', data);

    return data;
  } catch (error) {
    console.error('Erro ao buscar top users cost:', error);
    return [];
  }
};

const fetchTopModelsData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Se não especificar data final, força incluir data atual para garantir dados de hoje
      const today = new Date().toISOString().split('T')[0];
      params.append('end_date', today);
      console.log('[DEBUG] Top Models - Aplicando data final padrão:', today);
    }

    // Se limit está presente nos filtros, usa o valor (mesmo que seja null)
    // Se não está presente, usa 10 como padrão
    const limit = 'limit' in filters ? filters.limit : 10;
    // 🔧 CORREÇÃO: Tratamento explícito de limit null vs undefined
    if (limit !== undefined) {
      if (limit === null) {
        console.log('[DEBUG] ✅ SEM LIMIT - buscando todos os dados');
      } else {
        params.append('limit', limit.toString());
        console.log('[DEBUG] Enviando limit:', limit);
      }
    }

    const url = `${REPORT_CONFIG.URL_BASE}${REPORT_CONFIG.ENDPOINTS.TOP_MODELS}${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Models:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Dados Top Models recebidos:', data);

    const timestamp = new Date().getTime();

    let descriptions = {};

    let response2 = await fetch(`/api/models-descriptions`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    descriptions = await response2.json();

    data.map((model) => {
      model.name = descriptions[model.name]?.name || model.name;
    });

    return data;
  } catch (error) {
    console.error('Erro ao buscar top models:', error);
    return [];
  }
};

const fetchAvailableModels = async () => {
  try {
    const response = await fetch(
      `${REPORT_CONFIG.URL_BASE}${REPORT_CONFIG.ENDPOINTS.AVAILABLE_MODELS}`,
    );
    console.log('[DEBUG] Fazendo requisição para Available Models:', response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Modelos disponíveis recebidos:', data);

    return data;
  } catch (error) {
    console.error('Erro ao buscar modelos disponíveis:', error);
    return [];
  }
};

const fetchKPIsData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Para KPIs, incluímos data final até hoje para mostrar:
      // - Custo Total (Período): acumulado até hoje
      // - Novos Usuários: cadastrados até hoje
      const today = new Date().toISOString().split('T')[0];
      params.append('end_date', today);
      console.log('[DEBUG] KPIs - Aplicando data final padrão para incluir hoje:', today);
    }

    const url = `${REPORT_CONFIG.URL_BASE}${REPORT_CONFIG.ENDPOINTS.KPIS}${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para KPIs:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Dados KPIs recebidos:', data);

    return data;
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    return {
      totalCost: 0,
      newUsers: 0,
      activeAccounts: 0,
    };
  }
};

const fetchUserEfficiencyData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Se não especificar data final, força incluir data atual para garantir dados de hoje
      const today = new Date().toISOString().split('T')[0];
      params.append('end_date', today);
      console.log('[DEBUG] User Efficiency - Aplicando data final padrão:', today);
    }

    // Se limit está presente nos filtros, usa o valor (mesmo que seja null)
    // Se não está presente, usa 10 como padrão
    const limit = 'limit' in filters ? filters.limit : 10;
    // 🔧 CORREÇÃO: Tratamento explícito de limit null vs undefined
    if (limit !== undefined) {
      if (limit === null) {
        console.log('[DEBUG] ✅ SEM LIMIT - buscando todos os dados');
      } else {
        params.append('limit', limit.toString());
        console.log('[DEBUG] Enviando limit:', limit);
      }
    }

    const url = `${REPORT_CONFIG.URL_BASE}${REPORT_CONFIG.ENDPOINTS.USER_EFFICIENCY}${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para User Efficiency:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Dados User Efficiency recebidos:', data);

    return data;
  } catch (error) {
    console.error('Erro ao buscar user efficiency:', error);
    return [];
  }
};

const fetchTopCostCentersVolumeData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Se não especificar data final, força incluir data atual para garantir dados de hoje
      const today = new Date().toISOString().split('T')[0];
      params.append('end_date', today);
      console.log('[DEBUG] Top Cost Centers Volume - Aplicando data final padrão:', today);
    }

    // Se limit está presente nos filtros, usa o valor (mesmo que seja null)
    // Se não está presente, usa 10 como padrão
    const limit = 'limit' in filters ? filters.limit : 10;
    // 🔧 CORREÇÃO: Tratamento explícito de limit null vs undefined
    if (limit !== undefined) {
      if (limit === null) {
        console.log('[DEBUG] ✅ SEM LIMIT - buscando todos os dados');
      } else {
        params.append('limit', limit.toString());
        console.log('[DEBUG] Enviando limit:', limit);
      }
    }

    const url = `${REPORT_CONFIG.URL_BASE}reports/top-cost-centers-volume${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Cost Centers Volume:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Dados Top Cost Centers Volume recebidos:', data);

    return data;
  } catch (error) {
    console.error('Erro ao buscar top cost centers volume:', error);
    return [];
  }
};

const fetchTopCostCentersCostData = async (filters: any) => {
  try {
    const params = new URLSearchParams();

    if (filters.user && filters.user.trim()) {
      params.append('user', filters.user.trim());
      params.append('search_by', 'username');
    }

    if (filters.startDate) {
      params.append('start_date', filters.startDate);
    }

    if (filters.endDate) {
      params.append('end_date', filters.endDate);
    } else {
      // Se não especificar data final, força incluir data atual para garantir dados de hoje
      const today = new Date().toISOString().split('T')[0];
      params.append('end_date', today);
      console.log('[DEBUG] Top Cost Centers Cost - Aplicando data final padrão:', today);
    }

    // Se limit está presente nos filtros, usa o valor (mesmo que seja null)
    // Se não está presente, usa 10 como padrão
    const limit = 'limit' in filters ? filters.limit : 10;
    // 🔧 CORREÇÃO: Tratamento explícito de limit null vs undefined
    if (limit !== undefined) {
      if (limit === null) {
        console.log('[DEBUG] ✅ SEM LIMIT - buscando todos os dados');
      } else {
        params.append('limit', limit.toString());
        console.log('[DEBUG] Enviando limit:', limit);
      }
    }

    const url = `${REPORT_CONFIG.URL_BASE}reports/top-cost-centers-cost${params.toString() ? '?' + params.toString() : ''}`;
    console.log('[DEBUG] Fazendo requisição para Top Cost Centers Cost:', url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Dados Top Cost Centers Cost recebidos:', data);

    return data;
  } catch (error) {
    console.error('Erro ao buscar top cost centers cost:', error);
    return [];
  }
};

export {
  fetchAvailableModels,
  fetchKPIsData,
  fetchTopCostCentersCostData,
  fetchTopCostCentersVolumeData,
  fetchTopModelsData,
  fetchTopUsersCostData,
  fetchTopUsersVolumeData,
  fetchUsageCostData,
  fetchUserEfficiencyData,
};
