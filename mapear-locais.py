import requests
import pandas as pd
import time
import os
from dotenv import load_dotenv

def obter_detalhes_local(place_id, api_key):
    """
    Faz uma segunda requisição ao Google para puxar especificamente o Telefone e o Site
    usando o ID único do lugar (Place ID).
    """
    url_details = "https://maps.googleapis.com/maps/api/place/details/json"
    parametros = {
        'place_id': place_id,
        'fields': 'formatted_phone_number,website', # Pedimos só o que importa para economizar na API
        'key': api_key
    }
    
    try:
        resposta = requests.get(url_details, params=parametros)
        dados = resposta.json()
        
        if 'result' in dados:
            return {
                'Telefone': dados['result'].get('formatted_phone_number', 'Não disponível'),
                'Site': dados['result'].get('website', 'Não disponível')
            }
    except Exception as e:
        print(f"Erro ao buscar detalhes do lugar: {e}")
        
    return {'Telefone': 'Não disponível', 'Site': 'Não disponível'}

def mapear_mercado_black_sp(api_key):
    """
    Busca estabelecimentos com alto potencial de demanda e extrai contatos.
    Agora com paginação (para achar MUITO mais lugares).
    """
    endpoint_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    # Aumentamos o escopo! Coloquei mais bairros premium para explodir a quantidade de leads.
    consultas_estrategicas = [
        "hotel 5 estrelas Itaim Bibi São Paulo",
        "hotel 5 estrelas Jardins São Paulo",
        "hotel boutique Pinheiros São Paulo",
        "banco de investimento Faria Lima São Paulo",
        "banco de investimento Vila Olímpia São Paulo",
        "banco de investimento JK São Paulo",
        "escritório advocacia empresarial Vila Olímpia São Paulo",
        "escritório advocacia empresarial Faria Lima São Paulo",
        "hospital premium Morumbi São Paulo",
        "hospital premium Bela Vista São Paulo",
        "clinica de cirurgia plastica Jardins São Paulo",
        "clinica de cirurgia plastica Moema São Paulo",
        "agencia de turismo de luxo São Paulo",
        "agencia de turismo de luxo Alphaville"
    ]
    
    lista_leads = []
    print("Iniciando varredura estratégica com extração de contatos em São Paulo...")

    for query in consultas_estrategicas:
        print(f"\nBuscando: {query}...")
        
        parametros = {
            'query': query,
            'key': api_key
        }
        
        # Loop WHILE para varrer todas as páginas de resultados do Google (Paginação)
        while True:
            try:
                resposta = requests.get(endpoint_url, params=parametros)
                dados = resposta.json()
                
                if 'results' in dados:
                    for local in dados['results']:
                        nome = local.get('name')
                        place_id = local.get('place_id') # ID Único do local
                        
                        # Chama a função extra para pegar o Telefone!
                        detalhes = obter_detalhes_local(place_id, api_key)
                        
                        lista_leads.append({
                            'Nome do Estabelecimento': nome,
                            'Endereço': local.get('formatted_address'),
                            'Telefone': detalhes['Telefone'],
                            'Site': detalhes['Site'],
                            'Avaliação Google': local.get('rating', 'Sem nota'),
                            'Segmento/Alvo': query.split(' São Paulo')[0]
                        })
                
                # O Pulo do Gato para ter MAIS resultados: O Token de Próxima Página
                if 'next_page_token' in dados:
                    parametros['pagetoken'] = dados['next_page_token']
                    # O Google exige um pequeno descanso (sleep) de 2 seg antes de virar a página
                    time.sleep(2.5) 
                else:
                    break # Se não tiver mais botão de "próxima página", ele sai do While e vai pra próxima consulta
                    
            except Exception as e:
                print(f"Erro ao buscar '{query}': {e}")
                break # Sai do loop em caso de erro

    # Criação do DataFrame
    df_leads = pd.DataFrame(lista_leads)
    
    # Remove duplicatas (empresas que caíram em duas pesquisas diferentes)
    df_leads = df_leads.drop_duplicates(subset=['Nome do Estabelecimento'])
    
    # Exporta para CSV
    nome_arquivo = 'leads_transporte_executivo_premium_sp.csv'
    df_leads.to_csv(nome_arquivo, index=False, encoding='utf-8')
    
    print(f"\n=========================================")
    print(f"SUCESSO! {len(df_leads)} locais premium encontrados com telefones.")
    print(f"Dados salvos no arquivo: {nome_arquivo}")
    print(f"=========================================")
    
    return df_leads

# ==========================================
# EXECUÇÃO DO SCRIPT
# ==========================================
if __name__ == "__main__":
    load_dotenv()
    
    MINHA_API_KEY = os.getenv("GOOGLE_PLACES_KEY")
    
    if not MINHA_API_KEY:
        print("Erro: A chave GOOGLE_PLACES_KEY não foi encontrada no arquivo .env!")
    else:
        dados_finais = mapear_mercado_black_sp(MINHA_API_KEY)