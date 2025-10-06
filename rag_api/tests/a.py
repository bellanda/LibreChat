text = """Procedimento de criação do XML
Veículos, Peças e Serviços
SIR
Versão 1.4 - Março de 2018
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 2 de 18
CONTROLE DE VERSÃO
VRS. DATA AUTOR BREVE DESCRIÇÃO DA MUDANÇA
1 01/06/2010 T.I. Versão Inicial
2 05/07/2010 T.I. Ajustes no tamanho dos campos CPF
3 08/12/2010 T.I Inserção de Ordem de Serviço
4 01/04/2018 T.I Inserção de novas informações nas NF de Veículo
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 3 de 18
Sumário
1. Objetivo ........................................................................................................................................................................ 4
2. Modelo do XML ............................................................................................................................................................ 4
3. Detalhes do XML......................................................................................................................................................... 11
4. Caracteres Especiais ................................................................................................................................................... 17
5. SIR para Multimarcas ................................................................................................................................................. 17
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 4 de 18
1. Objetivo
A HPE Automotores do Brasil LTDA adotou o SIR (Sistema de Integração com a Rede) como ferramenta de 
integração (B2B – Business to Business) com as concessionárias.
A estratégia da HPE com o SIR é criar um mecanismo de troca de informações de negócio, de maneira
estruturada, ágil e eficaz entre as partes. Esta troca de informações permitirá que as empresas ampliem o volume de 
negócios em conjunto.
É importante frisar que o SIR será o responsável pela guarda das informações, não permitindo que nenhuma 
concessionária veja toda ou qualquer informação de outra.
O Sistema de Transferência de Arquivos tem como objetivo consistir e enviar estas informações, que estarão 
em arquivos no formato XML, para o Servidor que fará a integração com o SIR no escritório central.
Este manual descreve o formato dos arquivos XML.
2. Modelo do XML
<?xml version="1.0" encoding="ISO-8859-1" ?>
<notafiscal>
<header>
<!-- Tipo do arquivo pode ser T(teste) ou P(produção) -->
<tipoArquivo>T</tipoArquivo>
<!-- Cabeçalho da Nota Fiscal --> 
<!—- Para notas de Veículos o tipo da nota pode ser N(nova), 
C(cancelamento), CE(correção de arquivos enviados que geraram erros) e 
CC(correção de dados cadastrais do faturado e/ou arrendatário) -->
<!—- Para notas de Peças e Serviços o tipo da nota pode ser 
PSN(nova), PSC(cancelamento), PSCE(correção de arquivos enviados que geraram 
Warnings e/ou correção dos dados que foram enviados com informação incorreta) e 
PSCC (correção de dados cadastrais do faturado e/ou proprietário) -->
 <!—- Uma ordem de serviço deve ser enviada, quando esta ainda não 
estiver casada com uma nota fiscal de serviço. Neste caso, o valor da tag “tipo 
nota” deve ser OSN(Nova OS), OSC(Cancelamento OS) e OSCE(Correção de ordens de 
serviço enviadas e que geraram Warnings e/ou correção de dados que foram 
enviados com informação incorreta) -->
<tipoNota>PSN</tipoNota>
<!-- Código da concessionária -->
<codigoConcessionaria>30000</codigoConcessionaria>
<!-- CNPJ da Concessionária -->
<cnpjConcessionaria>01235454654</cnpjConcessionaria>
<!-- Natureza da operação - código C.F.O.P.-->
<natOper>NaturezaOperação</natOper>
<cfop>5404</cfop>
<!—- Numero da nota fiscal – Sendo o número da nota fiscal (somente 
permitido caracteres numéricos, até dez caracteres), mais a série da nota 
(permitido caracteres alfa numéricos, ate três caracteres), mais o giro da nota 
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 5 de 18
(somente permitido caracteres numéricos, ate três caracteres), separados por 
barra (‘/’). -->
<numeroNF>0123456789/25A/254</numeroNF>
<!-- Data da emissão -->
<dataEmissao>17/08/2004</dataEmissao>
<!—- Numero da Ordem de Serviço -->
<numeroOS>012345</numeroOS>
<!-- Data da Ordem de Serviço -->
<dataOS>17/08/2004</dataOS>
<!—Previsão Entrega -->
<dataPrevisao>17/08/2004</dataPrevisao>
<!-- Dados cadastrais do comprador da peça e/ou serviço -->
<faturado>
<!-- Tipo de pessoa: F(física) e J(jurídica) -->
<tipoPessoa>F</tipoPessoa>
<!-- Nome -->
<nome>Nome do faturado</nome>
<!-- O campo de CPF pode ser utilizado também para CNPJ em 
caso de pessoa jurídica -->
<cpf>12345678900</cpf>
<!-- O campo de RG pode ser utilizado também para a Inscrição 
Estadual em caso de pessoa jurídica -->
<rg>12658554655</rg>
<!-- Endereço -->
<endereco>
<!-- Tipo de logradouro (Rua, Avenida, Praça, Viela, Rodovia) -->
<tipoLogr>Rua</tipoLogr>
<!-- Logradouro -->
<logradouro>Fiandeiras</logradouro>
<!-- Número -->
<numero>929</numero>
<!-- Complemento -->
<complemento>11 andar</complemento>
<!-- Bairro -->
<bairro>Vila Olimpia</bairro>
<!-- Cidade -->
<cidade>São Paulo</cidade>
<!-- Estado -->
<estado>SP</estado>
<!-- CEP -->
<CEP>04545006</CEP>
<!-- País -->
<pais>Brasil</pais>
</endereco>
<!-- Telefone -->
<telefone>
<!-- Código DDI -->
<ddi>55</ddi>
<!-- Código DDD -->
<ddd>11</ddd>
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 6 de 18
 <!-- Número -->
<numero>38463190</numero>
<!-- Ramal -->
<ramal/>
</telefone>
<!-- Endereço eletrônico -->
<email>image@imagetec.com.br</email>
<!-- Data de nascimento -->
<data_nasc>10/10/1965</data_nasc>
<!-- Celular -->
<celular>
<!-- Código DDI -->
<ddi>55</ddi>
<!-- Código DDD -->
<ddd>11</ddd>
<!-- Número -->
<numero>38463190</numero>
</celular>
<!-- Telefone Residencial -->
< telefoneResidencial>
<!-- Código DDI -->
<ddi>55</ddi>
<!-- Código DDD -->
<ddd>11</ddd>
<!-- Número -->
<numero>38463190</numero>
</telefoneResidencial>
</faturado>
<!-- Informações sobre o proprietário do veículo -->
<!-- Atenção: se os dados do proprietário for o mesmo que os -->
<!-- dados do faturado não adicione esta tag! -->
<!-- neste caso vá direto p/ fechamento da tag header <\header> -->
<proprietarioVeiculo>
<!-- Tipo de pessoa: F(física) e J(jurídica) -->
<tipoPessoa>F</tipoPessoa>
<!-- Nome -->
<nome>Nome do proprietario</nome>
<!-- O campo de CPF pode ser utilizado também para CNPJ em 
caso de pessoa jurídica -->
<cpf>12345678900</cpf>
<!-- O campo de RG pode ser utilizado também para a Inscrição 
Estadual em caso de pessoa jurídica -->
<rg>12658554655A</rg>
<!-- Endereço -->
<endereco>
<!-- Tipo de logradouro (Rua, Avenida, Praça, Viela, 
Rodovia) -->
<tipoLogr>Rua</tipoLogr>
<!-- Logradouro -->
<logradouro>Fiandeiras</logradouro>
<!-- Número -->
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 7 de 18
<numero>929</numero>
<!-- Complemento -->
<complemento>11 andar</complemento>
<!-- Bairro -->
<bairro>Vila Olímpia</bairro>
<!-- Cidade -->
<cidade>São Paulo</cidade>
<!-- Estado -->
<estado>SP</estado>
<!-- CEP -->
<CEP>04545006</CEP>
<!-- País -->
<pais>Brasil</pais>
</endereco>
<!-- Telefone -->
<telefone>
<!-- Código DDI -->
<ddi>55</ddi>
<!-- Código DDD -->
<ddd>11</ddd>
<!-- Número -->
<numero>38463190</numero>
<!-- Ramal -->
<ramal/>
</telefone>
<!-- Endereço eletrônico -->
<email>image@imagetec.com.br</email>
<!-- Data de nascimento -->
<data_nasc>10/10/1965</data_nasc>
<!-- Celular -->
<celular>
<!-- Código DDI -->
<ddi>55</ddi>
<!-- Código DDD -->
<ddd>11</ddd>
<!-- Número -->
<numero>38463190</numero>
</celular>
<!-- Telefone Residencial -->
< telefoneResidencial>
<!-- Código DDI -->
<ddi>55</ddi>
<!-- Código DDD -->
<ddd>11</ddd>
<!-- Número -->
<numero>38463190</numero>
</telefoneResidencial>
</proprietarioVeiculo>
</header>
<!-- Dados do veículo -->
<!-- Tag para Notas de Venda de Veiculo -->
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 8 de 18
<veiculo>
<!-- Número do chassi -->
<chassi>83979ODFA09DFA98DFA</chassi>
<!-- Valor do Veículo -->
<valorVeiculo>85000</valorVeiculo>
<!-- Veículo Zero com Emplacamento -->
<zeroEmplacado>N</zeroEmplacado>
</veiculo>
<!-- Tag para Notas de Venda de Veiculo -->
<!-- Tag para Notas de Pecas e Servicos -->
<veiculo>
<!-- Número do chassi -->
<chassi>83979ODFA09DFA98DFA</chassi>
<!-- Placa do veículo -->
<placa>LCV-9999</placa>
<km>120500.78</km>
</veiculo>
<!-- Tag para Notas de Pecas e Servicos -->
<!-- Informação de itens vendidos -->
<itensVendidos>
<!-- Para cada produto vendido repetir a estrutura abaixo -->
<!-- No exemplo informamos que a nota contem somente 3 produtos -->
<!-- mas poderíamos ter 100 itens ou mais, não existe limite -->
<!-- da quantidade produtos de uma nota. -->
<detalhesItem>
<!-- produto 1 - 2 amortecedores -->
<sequencia>1</sequencia>
<partNumber>100088</partNumber>
<descrItem>Filtro Combustivel</descrItem>
<unidadeMedida>Pecas</unidadeMedida>
<precoUnitario>10.99</precoUnitario>
<quantidade>2</quantidade>
<descontoUnitario>8.99</descontoUnitario>
</detalhesItem>
<detalhesItem>
<!-- produto 2 - 2 molas -->
<sequencia>2</sequencia>
<partNumber>23088</partNumber>
<descrItem>Parafuso</descrItem>
<unidadeMedida>Unidades</unidadeMedida>
<precoUnitario>580.00</precoUnitario>
<quantidade>2</quantidade>
<descontoUnitario>55.00</descontoUnitario>
</detalhesItem>
<detalhesItem>
<!-- produto 3 - 2,5 litros de fluidos -->
<sequencia>3</sequencia>
<partNumber>32338</partNumber>
<descrItem>Óleo</descrItem>
<unidadeMedida>Litros</unidadeMedida>
<precoUnitario>10.00</precoUnitario>
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 9 de 18
<quantidade>2.5</quantidade>
<descontoUnitario>0.00</descontoUnitario>
</detalhesItem>
</itensVendidos>
<!-- Valor do Serviço -->
<servicos>
<!-- Valor do Serviço -->
<valorServico>128900.77</valorServico>
</servicos>
 <!-- Informação dos Serviços -->
<itensOS>
 <!-- Para cada serviço realizado, repetir a estrutura abaixo -->
<!-- No exemplo informamos que a ordem serviço contem somente 3 -->
<!-- serviços, mas poderíamos ter 100 linhas ou mais, -->
<!-- não existe limite da quantidade de serviços em uma OS. -->
<detalhesServicos>
<seqservico>1</seqservico>
<codigoServico>SEALI01</codigoServico>
<descricaoServico>Serviço de Alinhamento Dianteiro 
</descricaoServico>
< precoUnitServico>30.00</ precoUnitServico>
<quantidadeServico>1</quantidadeServico>
<descontoUnitServico>0</descontoUnitServico>
 <respostaReparo>Alinhamento Realizado</respostaReparo>
</detalhesServicos>
<detalhesServicos>
<seqServico>2</seqServico>
<codigoServico>REV02</codigoServico>
<descricaoServico>Segunda Revisão</descricaoServico>
<precoUnitServico>393.00</precoUnitServico>
<quantidadeServico>1</quantidadeServico>
<descontoUnitServico>13.00</descontoUnitServico>
 <respostaReparo>Segunda Revisão Realizada.</respostaReparo>
</detalhesServicos>
<detalhesServicos>
<seqServico>3</seqServico>
<codigoServico>SERFA</codigoServico>
<descricaoServico>Serviço de Regulagem nos Faróis 
</descricaoServico>
<precoUnitServico>0</precoUnitServico>
<quantidadeServico>0</quantidadeServico>
<descontoUnitServico>0</descontoUnitServico>
 <respostaReparo>Não foi necessário realizar a regulagem dos 
faróis.</respostaReparo>
 </detalhesServicos>
 </itensOS>
 <ordemServico>
<!-- Tipo do Cliente: U(Usuário), C(Condutor) e P(Proprietário) -->
<tipoCliente>U</tipoCliente>
 
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 10 de 18
 <!-- Tipo de OS: C(Cliente), F (Funilaria e Pintura), A Acessórios), 
 G(Garantia), I(Interno), 
R (Serviços de retorno e retrabalho) -->
<tipoOS>C</tipoOS>
<!—- Forma de Pagamento: AV(A Vista e PP(Parcelado) -->
 <formaPagamento>AV</formaPagamento>
<!—- Observações referentes à Ordem de Serviço -->
 <obs>O veículo é utilizado apenas na cidade.</obs>
</ordemServico>
<!-- Funcionário que realizou o atendimento (vendedor) -->
<atendente>
<!-- Nome do atendente -->
<nome>José Ribeiro</nome>
<!-- CPF do atendente -->
<cpf>12345678900</cpf>
<!-- Email do atendente -->
<email>teste@teste.com.br</email>
<!-- Gerente do atendente -->
<gerente>
<!-- Nome do Gerente -->
<nome>Carlos Antonio</nome>
<!-- CPF do Gerente -->
<cpf>12345678901</cpf>
<!-- Email do Gerente -->
<email>teste@teste.com.br</email>
</gerente>
<!-— Código da Concessionária que realizou a venda -->
<codigoConcVenda>50001</codigoConcVenda>
</atendente>
<!-- E-mail de contato -->
<emailOut>teste@hotmail.com.br</emailOut>
</notafiscal>
Obs: Cada cor representa quais dados devem ser preenchidos em cada tipo de nota fiscal. No caso de peças e 
serviços pode-se criar um único XML, se a nota fiscal for à mesma.
Todos (Veículos, Peças, Serviços e Ordens de Serviço)
Somente Notas Fiscais 
Peças e Serviços
Somente Ordens de Serviço
Somente Veículos
Somente Peças
Serviços e Ordem de Serviço
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 11 de 18
3. Detalhes do XML
Segue abaixo detalhes do que é necessário ser observado na criação do XML para envio de notas fiscais de 
veículos, peças e serviços.
Header Arquivo - Preenchimento Obrigatório Veículos, Peças, Serviços e Ordens de Serviços
Nº Código dos 
Identificadores Valores Válidos Máximo Status OBS.
1
<?xml version="1.0" 
encoding = ISSO-8859-
1"?>
NA M Cabeçalho do Documento
2 notafiscal NA M Cabeçalho do Documento
3 header NA M Cabeçalho do Documento
4 tipoArquivo T/P 1 M T(Teste) / P(Produção) 
5 tipoNota
Veículos → N/C/CE/CC
Peças e Serviços → 
PSN/PSC/PSCE/PSCC
Ordens de Serviços → 
OSN/OSC/OSCE
4 M
Veículos → N(Nova), 
C(Cancelamento), CE(Correção 
Warning) e CC(Correção dados)
Peças e Serviços → PSN(Nova), 
PSC(Cancelada), PSCE(Correção 
Warning) e PSCC(Correção 
dados)
Ordens de Serviços → 
OSN(Nova), OSC(Cancelada), 
OSCE(Correção Warning OU 
dados)
6 codigoConcessionaria 6 M Código da Concessionária
7 cnpjConcessionaria 18 C CNPJ
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 12 de 18
Preenchimento Obrigatório para Notas Fiscais
Nº Código Dos 
Identificador Valores Validos Máximo Status OBS.
1 natOper 50 M Descreve o Tipo de Transação
2 cfop 4 M CFOP da Operação
3 numeroNF 18 M
Número da Nota Fiscal/Série/Giro
(0123456789/25A/254)
4 dataEmissao 10 M Data De Emissão(DD/MM/YYYY)
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Preenchimento Obrigatório para Ordens de Serviços
Nº Código Dos 
Identificador Valores Validos Máximo Status OBS.
1 numeroOS 18 M Número da OS
2 dataOS 10 M Data da OS Emissão(DD/MM/YYYY)
3 dataPrevisao 10 C
Data De Previsão de 
Entrega(DD/MM/YYYY)
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Faturado - Preenchimento Obrigatório Veículos, Peças e Serviços
Nº Código dos 
Identificadores Valores Válidos Máximo Status OBS.
1 faturado NA M Cabeçalho do Faturado
2 tipoPessoa F/J 1 M
F(Pessoa Física) / J(Pessoa 
Jurídica)
3 nome 70 M Nome ou Razão Social do Faturado
4 cpf 18 M
CPF - Não utilizar separadores (/), 
(.) (-).
5 rg 18 C
Código do RG - Não utilizar 
separadores (/), (.) (-).
6 endereco NA M Cabeçalho do Endereço
7 tipoLogr Rua, Avenida, Praça, 
etc.
12 M Tipo do Logradouro
8 logradouro 70 M Logradouro
9 numero 20 C Número do Endereço Do Faturado
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 13 de 18
10 complemento 50 C Complemento do Endereço 
11 bairro 30 M Bairro
12 cidade 30 M Cidade 
13 estado 2 M Estado 
14 cep 8 M CEP 
15 pais 30 M País 
16 telefone NA M Cabeçalho Telefone
17 ddi 3 M DDI Do Telefone
18 ddd 3 M DDD Do Telefone
19 numero 12 M Numero do Telefone
20 ramal 4 C Ramal do Telefone
21 email 50 M E-mail
22 data_nasc 10 C Data de Nascimento
23 celular NA C Cabeçalho Celular
24 ddi 3 M DDI Do Telefone
25 ddd 3 M DDD Do Telefone
26 numero 12 M Número do Telefone
27 telefoneResidencial NA C Cabeçalho Telefone Residencial
28 ddi 3 M DDI Do Telefone Residencial
29 ddd 3 M DDD Do Telefone Residencial
30 numero 12 M Número do Telefone Residencial
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Proprietário do Veículo
Nº Código dos Identificadores Valores Válidos Máximo Status OBS.
1 proprietarioVeiculo Cabeçalho do Proprietário do 
Veículo
2 tipoPessoa F/J 1 M F(Pessoa Física) / J(Pessoa Jurídica)
3 nome 70 M Nome do Proprietário
4 cpf 18 M
CPF - Não utilizar separadores (/), 
(.) (-).
5 rg 18 C
Código do RG - Não utilizar 
separadores (/), (.) (-).
6 endereco NA M Cabeçalho do Endereço
7 tipoLogr Rua, Avenida, Praça, 
etc.
12 M Tipo do Logradouro
8 logradouro 70 M Logradouro
9 numero 20 C Número do Endereço Do Faturado
10 complemento 50 C Complemento do Endereço 
11 bairro 30 M Bairro
12 cidade 30 M Cidade 
13 estado 2 M Estado 
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 14 de 18
14 cep 8 M CEP 
15 pais 30 M Pais 
16 telefone NA M Cabeçalho Telefone
17 ddi 3 M DDI Do Telefone
18 ddd 3 M DDD Do Telefone
19 numero 12 M Numero do Telefone
20 ramal 4 C Ramal do Telefone
21 email 50 C E-mail
22 data_nasc 10 C Data de Nascimento
23 celular NA C Cabeçalho Celular
24 ddi 3 M DDI Do Telefone
25 ddd 3 M DDD Do Telefone
26 numero 12 M Número do Telefone
27 telefoneResidencial NA C Cabeçalho Telefone Residencial
28 ddi 3 M DDI Do Telefone Residencial
29 ddd 3 M DDD Do Telefone Residencial
30 numero 12 M Número do Telefone Residencial
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Veículo - Preenchimento Obrigatório Veículos
Nº Código Dos 
Identificador Valores Validos Máximo Status OBS.
1 veiculo NA M Cabeçalho do Veículo
2 chassi 22 M Chassi do Veículo
3 valorVeiculo 10 M Valor Veículo
4 zeroEmplacado S (Sim), N (Não) 1 C Veículo Zero com Emplacamento
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Veículo - Preenchimento Obrigatório Veículos, Peças e Serviços
Nº Código dos 
Identificadores Valores Válidos Máximo Status OBS.
1 veiculo NA M Cabeçalho do Veículo
2 chassi 22 M Chassi do Veículo
3 placa 8 C Placa do Veículo
4 km 8 C Quilometragem do Veículo
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 15 de 18
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Itens Vendidos - Preenchimento Obrigatório Peças
Nº Código dos 
Identificadores Valores Válidos Máximo Status OBS.
1 itensVendidos NA M Cabeçalho Itens Vendidos
2 detalhesItem NA M Cabeçalho do Item
3 sequencia 3 M Sequência do Item
4 partNumber 20 M Código do Item
5 descrItem 60 M Descrição do Item
6 unidadeMedida Pecas/Unidades/Litros 8 M Unidade de Medida
7 precoUnitario 10 M Preço Unitário do Item
8 quantidade 10 M Quantidade do Item
9 descontoUnitario Valor Absoluto 10 M Desconto Unitário do Item
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Serviços Executados - Preenchimento Obrigatório Serviços
Nº Código dos Identificadores Valores Válidos Máximo Status OBS.
1 servicos NA Cabeçalho Serviços
2 valorServico 10 M Valor do Serviço
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Itens OS - Preenchimento Obrigatório Serviços e Ordens de Serviços
Nº Código dos 
Identificadores Valores Válidos Máximo Status OBS.
1 itensOS NA M Cabeçalho Itens OS
2 detalhesServicos NA M Cabeçalho Detalhes Serviços
3 seqServico 3 M Sequência do Serviço
4 codigoServico 10 M Código do Serviço
5 descricaoServico 100 M Descrição do Serviço
6 precoUnitServico 10 M Preço Unitário do Serviço
7 quantidadeServico 10 M Quantidade do Serviço
8 descontoUnitServico Valor Absoluto 10 M Desconto Unitário do Serviço
9 respostaReparo 250 M Resposta ao Diagnóstico/Reparo
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 16 de 18
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Ordem de Serviço - Preenchimento Obrigatório Serviços e Ordens de Serviços
Nº Código dos Identificadores Valores Válidos Máximo Status OBS.
1 ordemServico NA Cabeçalho Ordem Serviço
2 tipoCliente
U(Usuário), 
C(Condutor) e 
P(Proprietário)
1 M Tipo do Cliente
3 tipoOS
C(Cliente), 
F (Funilaria e 
Pintura), 
A (Acessórios), 
G(Garantia), 
I(Interno),
R (Serviços de 
retorno e 
retrabalho)
1 M Tipo da OS
4 formaPagamento AV(A Vista e 
PP(Parcelado) 2 M Forma de Pagamento
5 obs 250 C Observações OS
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
Atendente (Vendedor) - Preenchimento Obrigatório Veículos, Peças e Serviços
Nº Código dos Identificadores Valores Válidos Máximo Status OBS.
1 atendente NA Cabeçalho do Atendente
2 nome 70 M Nome do Atendente
3 cpf 11 M CPF do Atendente
4 email 50 C E-mail do Atendente
5 gerente NA C Cabeç. Gerente resp. Atendente
6 nome 70 M Nome do Gerente
7 cpf 11 M
CPF – Não utilizar separadores (/), (.), 
(-).
8 Email 50 M E-mail do Gerente
9 codigoConcVenda 6 C Cód. Concessionária da Venda
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
E-mail de Contato da Concessionária
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 17 de 18
Nº Código dos Identificadores Valores Válidos Máximo Status OBS.
1 emailOut C E-mail de Contato da Concessionária
OBS.:
Status M = Preenchimento Obrigatório
Status C = Preenchimento Condicional 
NA = Não Aplicável
Valores Válidos = Valores Aceitáveis por Campo 
4. Caracteres Especiais
Segue abaixo a lista de caracteres reservados para linguagem XML. Se for necessária a utilização de algum 
deles no preenchimento dos dados, os mesmos devem estar na forma apresentado abaixo.
Lista de Caracteres Especiais
Nº Caractere Significado Forma de Preenchimento OBS.
1 > maior do que &gt;
2 < menor que &lt;
3 % por cento &#37;
4 & “E” comercial &amp;
5. SIR para Multimarcas
A concessionária multimarca poderá optar pelo aplicativo SIR (MMC ou SVB) que desejar realizar o envio das
notas. Concessionárias que não forem multimarcas, deverão continuar enviando o XML no aplicativo SIR específico da
marca com a qual trabalha.
VEÍCULOS
Quando o aplicativo receber as notas fiscais, ele irá verificar a origem do veículo. O sistema do SIR verificará
automaticamente a marca do veículo e fará a gravação do XML para contabilização dos valores em seu respectivo
Portal Extranet (MMC ou SVB).
PEÇAS
Quando o aplicativo receber estas notas fiscais, ele irá verificar a origem da peça. O sistema do SIR verificará
automaticamente a marca da peça e fará a separação dos itens do XML para contabilização dos valores em seu
respectivo Portal Extranet (MMC ou SVB).
Exemplo: Uma nota contendo 8 itens, sendo 5 itens MMC e 3 SVB. Esta nota terá 5 itens contabilizados no
Portal Extranet MMC e 3 itens contabilizados no Portal Extranet SVB.
Obs.: Toda peça que for considerada paralela entrará na contabilização do Portal Extranet MMC.
Identificação
Tecnologia da Informação
Código
TI.AG.00.002
Assunto
Procedimento para criação de XML – Veículos, Peças, 
Serviços e Ordem de Serviços
Revisão
03/2018
Publicação
01/04/2018
HPE Automotores do Brasil LTDA.
T.I. – Tecnologia da Informação
Página 18 de 18
SERVIÇOS
Quando o aplicativo receber as notas fiscais, será verificado a origem do veículo. Baseando-se na marca
definida nesta validação, o sistema fará a gravação do XML para contabilização dos valores em seu respectivo Portal
Extranet (MMC ou SVB). A TAG <chassi></chassi> é obrigatória no XML.
Obs.: Todo veículo que não for MMC ou SVB, terá a contabilização do serviço realizada no Portal Extranet 
MMC.
"""

import tiktoken

# Para GPT-4, GPT-3.5-turbo
encoding = tiktoken.encoding_for_model("gpt-4o")
tokens = encoding.encode(text)
print(f"Total de tokens: {len(tokens)}")

# Alternativa: usar encoding direto
encoding = tiktoken.get_encoding("cl100k_base")
