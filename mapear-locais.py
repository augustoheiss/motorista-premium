import requests
import pandas as pd
import time
import os
from dotenv import load_dotenv

def mapear_mercado_black_sp(api_key):
    """
    Busca estabelecimentos com alto potencial de demanda para motoristas executivos em SP.
    Requer uma chave válida da API do Google Places (GCP).
    """
    
    endpoint_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    # Consultas estratégicas focadas no mapa de calor "Black" de São Paulo
    consultas_estrategicas = [
        "hotel 5 estrelas Itaim Bibi São Paulo",
        "hotel boutique Jardins São Paulo",
        "banco de investimento Faria Lima São Paulo",
        "escritório advocacia empresarial Vila Olímpia São Paulo",
        "hospital premium Morumbi São Paulo",
        "hospital premium Bela Vista São Paulo",
        "clinica de cirurgia plastica Jardins São Paulo",
        "agencia de turismo de luxo São Paulo"
    ]
    
    lista_leads = []

    print("Iniciando varredura estratégica em São Paulo...")

    for query in consultas_estrategicas:
        print(f"Buscando: {query}...")
        
        parametros = {
            'query': query,
            'key': api_key
        }
        
        try:
            resposta = requests.get(endpoint_url, params=parametros)
            dados = resposta.json()
            
            if 'results' in dados:
                for local in dados['results']:
                    lista_leads.append({
                        'Nome do Estabelecimento': local.get('name'),
                        'Endereço': local.get('formatted_address'),
                        'Latitude': local['geometry']['location']['lat'] if 'geometry' in local else None,
                        'Longitude': local['geometry']['location']['lng'] if 'geometry' in local else None,
                        'Avaliação Google': local.get('rating', 'Sem nota'),
                        'Segmento/Alvo': query.split(' São Paulo')[0] # Limpa a string para categorizar
                    })
                    
            # Pausa de 2 segundos para respeitar o limite de requisições da API
            time.sleep(2) 
            
        except Exception as e:
            print(f"Erro ao buscar '{query}': {e}")

    # Criação do DataFrame
    df_leads = pd.DataFrame(lista_leads)
    
    # Remove duplicatas caso um lugar apareça em mais de uma busca
    df_leads = df_leads.drop_duplicates(subset=['Nome do Estabelecimento'])
    
    # Exporta para CSV
    nome_arquivo = 'leads_transporte_executivo_sp.csv'
    df_leads.to_csv(nome_arquivo, index=False, encoding='utf-8')
    
    print(f"\nSucesso! {len(df_leads)} locais premium encontrados.")
    print(f"Dados salvos no arquivo: {nome_arquivo}")
    
    return df_leads



# ... (aqui fica aquela função mapear_mercado_black_sp que eu te mandei antes) ...

# ==========================================
# EXECUÇÃO DO SCRIPT
# ==========================================
if __name__ == "__main__":
    # 1. Carrega as variáveis que estão escondidas no arquivo .env
    load_dotenv()
    
    # 2. Puxa a chave específica pelo nome que você deu lá no .env
    MINHA_API_KEY = os.getenv("GOOGLE_PLACES_KEY")
    
    # 3. Uma trava de segurança rápida só para garantir que ele achou a chave
    if not MINHA_API_KEY:
        print("Erro: A chave GOOGLE_PLACES_KEY não foi encontrada no arquivo .env!")
    else:
        # Se achou a chave, roda o nosso script de prospecção
        dados_finais = mapear_mercado_black_sp(MINHA_API_KEY)
        # print(dados_finais.head())