import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Informações que Coletamos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Informações de Conta:</strong> Nome, email, nome de usuário, data de nascimento, 
                  localização e outras informações que você fornece durante o registro.
                </p>
                <p>
                  <strong>Conteúdo do Usuário:</strong> Posts, fotos, vídeos, mensagens e outros conteúdos 
                  que você compartilha em nossa plataforma.
                </p>
                <p>
                  <strong>Informações de Uso:</strong> Como você interage com nossa plataforma, incluindo 
                  páginas visitadas, tempo de permanência e ações realizadas.
                </p>
                <p>
                  <strong>Informações Técnicas:</strong> Endereço IP, tipo de dispositivo, navegador e 
                  informações de localização aproximada.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Como Usamos Suas Informações
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Fornecer Nossos Serviços:</strong> Para criar e manter sua conta, processar 
                  pagamentos e fornecer funcionalidades da plataforma.
                </p>
                <p>
                  <strong>Personalizar Experiência:</strong> Para mostrar conteúdo relevante, sugestões 
                  de conexões e anúncios personalizados.
                </p>
                <p>
                  <strong>Comunicação:</strong> Para enviar notificações sobre atividades da conta, 
                  atualizações de segurança e marketing (com seu consentimento).
                </p>
                <p>
                  <strong>Segurança:</strong> Para detectar e prevenir fraudes, abusos e atividades 
                  ilegais em nossa plataforma.
                </p>
                <p>
                  <strong>Melhorias:</strong> Para analisar o uso da plataforma e desenvolver novos 
                  recursos e funcionalidades.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Compartilhamento de Informações
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Com Outros Usuários:</strong> Informações do seu perfil público podem ser 
                  visíveis para outros usuários conforme suas configurações de privacidade.
                </p>
                <p>
                  <strong>Prestadores de Serviços:</strong> Podemos compartilhar informações com 
                  terceiros que nos ajudam a operar a plataforma (processamento de pagamentos, 
                  hospedagem, análise).
                </p>
                <p>
                  <strong>Requisitos Legais:</strong> Podemos divulgar informações quando exigido por 
                  lei ou para proteger nossos direitos e segurança.
                </p>
                <p>
                  <strong>Com Seu Consentimento:</strong> Podemos compartilhar informações com terceiros 
                  quando você nos autorizar explicitamente.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Seus Direitos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Acesso:</strong> Você pode acessar e revisar as informações pessoais que 
                  mantemos sobre você.
                </p>
                <p>
                  <strong>Correção:</strong> Você pode solicitar a correção de informações imprecisas 
                  ou incompletas.
                </p>
                <p>
                  <strong>Exclusão:</strong> Você pode solicitar a exclusão de suas informações pessoais, 
                  sujeito a certas exceções legais.
                </p>
                <p>
                  <strong>Portabilidade:</strong> Você pode solicitar uma cópia de seus dados em formato 
                  estruturado e legível por máquina.
                </p>
                <p>
                  <strong>Oposição:</strong> Você pode se opor ao processamento de suas informações 
                  pessoais para certas finalidades.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Segurança dos Dados
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger 
                  suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
                <p>
                  No entanto, nenhum método de transmissão pela internet ou método de armazenamento 
                  eletrônico é 100% seguro. Embora nos esforcemos para usar meios comercialmente 
                  aceitáveis para proteger suas informações pessoais, não podemos garantir sua segurança absoluta.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Retenção de Dados
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços, 
                  cumprir obrigações legais, resolver disputas e fazer cumprir nossos acordos.
                </p>
                <p>
                  Quando você exclui sua conta, podemos reter certas informações por um período limitado 
                  para cumprir obrigações legais ou para fins de segurança.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cookies e Tecnologias Similares
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar 
                  o uso da plataforma e fornecer funcionalidades personalizadas.
                </p>
                <p>
                  Você pode controlar o uso de cookies através das configurações do seu navegador, 
                  mas isso pode afetar a funcionalidade de nossa plataforma.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Transferências Internacionais
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Suas informações podem ser transferidas e processadas em países diferentes do seu 
                  país de residência. Garantimos que essas transferências sejam feitas em conformidade 
                  com leis de proteção de dados aplicáveis.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Menores de Idade
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente 
                  informações pessoais de menores de 18 anos.
                </p>
                <p>
                  Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, 
                  entre em contato conosco imediatamente.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Alterações nesta Política
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
                  sobre mudanças materiais enviando um email para o endereço associado à sua conta 
                  ou publicando um aviso em nossa plataforma.
                </p>
                <p>
                  Recomendamos que você revise esta Política regularmente para se manter informado 
                  sobre como protegemos suas informações.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Contato
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como processamos 
                  suas informações pessoais, entre em contato conosco:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                <li>Email: juridico@openlove.com</li>
                  <li>Endereço: R. Albino Torraca, 940 - Dourados - Mato Grosso do Sul</li>
                  <li>Telefone: (18) 99636-2519</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 