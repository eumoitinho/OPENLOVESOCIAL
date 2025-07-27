import Link from "next/link"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Termos de Serviço
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Aceitação dos Termos
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Ao acessar e usar a plataforma OpenLove, você concorda em cumprir e estar vinculado 
                  a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, 
                  não deve usar nossos serviços.
                </p>
                <p>
                  Estes termos constituem um acordo legal entre você e a OpenLove. Recomendamos que 
                  você leia cuidadosamente estes termos antes de usar nossa plataforma.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Descrição dos Serviços
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  A OpenLove é uma plataforma de rede social que permite aos usuários:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criar e gerenciar perfis pessoais</li>
                  <li>Conectar-se com outros usuários</li>
                  <li>Compartilhar conteúdo, fotos e vídeos</li>
                  <li>Participar de comunidades e grupos</li>
                  <li>Enviar mensagens privadas</li>
                  <li>Participar de eventos e atividades</li>
                  <li>Acessar conteúdo premium (mediante assinatura)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Elegibilidade e Registro
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Idade Mínima:</strong> Você deve ter pelo menos 18 anos para usar nossos 
                  serviços. Ao se registrar, você confirma que atende a este requisito.
                </p>
                <p>
                  <strong>Informações Precisas:</strong> Você deve fornecer informações precisas, 
                  completas e atualizadas durante o registro e uso da plataforma.
                </p>
                <p>
                  <strong>Responsabilidade da Conta:</strong> Você é responsável por manter a 
                  confidencialidade de suas credenciais de login e por todas as atividades que 
                  ocorrem em sua conta.
                </p>
                <p>
                  <strong>Uma Conta por Pessoa:</strong> Você pode criar apenas uma conta pessoal. 
                  Contas comerciais ou organizacionais podem ser permitidas mediante aprovação.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Conduta do Usuário
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Comportamento Respeitoso:</strong> Você deve tratar outros usuários com 
                  respeito e não deve assediar, intimidar ou abusar de outros usuários.
                </p>
                <p>
                  <strong>Conteúdo Apropriado:</strong> Você não deve compartilhar conteúdo que seja:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ilegal, difamatório, obsceno ou ofensivo</li>
                  <li>Violento, ameaçador ou que promova ódio</li>
                  <li>Spam, comercial não autorizado ou fraudulento</li>
                  <li>Que viole direitos de propriedade intelectual</li>
                  <li>Que exponha informações pessoais de terceiros</li>
                  <li>Que contenha vírus ou código malicioso</li>
                </ul>
                <p>
                  <strong>Uso Adequado:</strong> Você deve usar nossos serviços apenas para fins 
                  legítimos e não deve tentar contornar medidas de segurança ou acessar sistemas 
                  não autorizados.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Conteúdo do Usuário
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Propriedade:</strong> Você mantém a propriedade do conteúdo que compartilha, 
                  mas concede à OpenLove uma licença mundial, não exclusiva, para usar, reproduzir, 
                  modificar e distribuir seu conteúdo em nossa plataforma.
                </p>
                <p>
                  <strong>Responsabilidade:</strong> Você é responsável pelo conteúdo que compartilha 
                  e deve ter os direitos necessários para compartilhar tal conteúdo.
                </p>
                <p>
                  <strong>Remoção:</strong> Podemos remover conteúdo que viole estes termos ou 
                  políticas da plataforma, a nosso critério exclusivo.
                </p>
                <p>
                  <strong>Backup:</strong> Recomendamos que você mantenha cópias de seu conteúdo 
                  importante, pois não garantimos que o conteúdo será preservado indefinidamente.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Privacidade e Dados
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Política de Privacidade:</strong> O uso de suas informações pessoais é 
                  regido por nossa Política de Privacidade, que faz parte destes termos.
                </p>
                <p>
                  <strong>Configurações de Privacidade:</strong> Você pode controlar a visibilidade 
                  de seu perfil e conteúdo através das configurações de privacidade da plataforma.
                </p>
                <p>
                  <strong>Dados de Uso:</strong> Podemos coletar e usar dados sobre como você usa 
                  nossa plataforma para melhorar nossos serviços e fornecer funcionalidades personalizadas.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Pagamentos e Assinaturas
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Planos Premium:</strong> Oferecemos planos de assinatura premium que 
                  fornecem recursos adicionais. Os preços e recursos estão sujeitos a alterações.
                </p>
                <p>
                  <strong>Renovação Automática:</strong> Assinaturas premium são renovadas 
                  automaticamente até que você cancele. Você pode cancelar a qualquer momento.
                </p>
                <p>
                  <strong>Reembolsos:</strong> Políticas de reembolso estão sujeitas aos termos 
                  de nossos processadores de pagamento e leis aplicáveis.
                </p>
                <p>
                  <strong>Impostos:</strong> Você é responsável por pagar quaisquer impostos 
                  aplicáveis sobre suas compras.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Propriedade Intelectual
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Nossa Propriedade:</strong> A plataforma OpenLove, incluindo seu design, 
                  funcionalidades e conteúdo original, é propriedade da OpenLove e está protegida 
                  por leis de propriedade intelectual.
                </p>
                <p>
                  <strong>Licença Limitada:</strong> Concedemos a você uma licença limitada, 
                  não exclusiva e revogável para usar nossa plataforma conforme estes termos.
                </p>
                <p>
                  <strong>Marcas Registradas:</strong> O nome "OpenLove" e logos relacionados são 
                  marcas registradas da nossa empresa.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Limitação de Responsabilidade
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Serviços "Como Estão":</strong> Nossos serviços são fornecidos "como estão" 
                  e "conforme disponível", sem garantias de qualquer tipo.
                </p>
                <p>
                  <strong>Limitação de Danos:</strong> Em nenhuma circunstância a OpenLove será 
                  responsável por danos indiretos, incidentais, especiais ou consequenciais.
                </p>
                <p>
                  <strong>Limitação de Responsabilidade:</strong> Nossa responsabilidade total será 
                  limitada ao valor pago por você nos últimos 12 meses.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Modificações e Encerramento
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Alterações nos Termos:</strong> Podemos modificar estes termos a qualquer 
                  momento. Notificaremos você sobre mudanças materiais.
                </p>
                <p>
                  <strong>Alterações no Serviço:</strong> Podemos modificar ou descontinuar 
                  funcionalidades da plataforma a qualquer momento.
                </p>
                <p>
                  <strong>Encerramento da Conta:</strong> Você pode encerrar sua conta a qualquer 
                  momento. Podemos suspender ou encerrar sua conta por violação destes termos.
                </p>
                <p>
                  <strong>Efeito do Encerramento:</strong> Após o encerramento, você não terá mais 
                  acesso à sua conta, mas certas informações podem ser retidas conforme nossa 
                  Política de Privacidade.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Lei Aplicável e Disputas
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Lei Aplicável:</strong> Estes termos são regidos pelas leis do Brasil, 
                  sem considerar conflitos de leis.
                </p>
                <p>
                  <strong>Resolução de Disputas:</strong> Qualquer disputa será resolvida através 
                  de arbitragem ou nos tribunais competentes do Brasil.
                </p>
                <p>
                  <strong>Disposições Separáveis:</strong> Se qualquer disposição destes termos 
                  for considerada inválida, as demais disposições permanecerão em vigor.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Contato
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
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
