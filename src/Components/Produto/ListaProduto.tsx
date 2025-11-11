import { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Alert, ProgressBar } from "react-bootstrap";
import '../Produto/ListaProduto.css';
import { Link, useLocation, useNavigate } from "react-router-dom";

type Produto = {
  id: number; 
  nome: string; 
  descricao: string; 
  imagem_capa?: string;
  valor_meta?: number;
  valor_arrecadado?: number; 
  categoria?: {
    id: number;
    nome: string;
  };
  criador?: {
    id: number;
    nome: string;
  };
};

function ListaProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [todosProdutos, setTodosProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const location = useLocation();
  const navigate = useNavigate(); 

  const queryParams = new URLSearchParams(location.search);
  const termoBusca = queryParams.get('buscaporNome') || '';
  const categoriaFiltro = queryParams.get('categoria') || '';

  useEffect(() => {
    carregarTodosProdutos();
  }, []);

  useEffect(() => {
    if (todosProdutos.length > 0) {
      aplicarFiltros();
    }
  }, [termoBusca, categoriaFiltro, todosProdutos]);

  const carregarTodosProdutos = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await fetch(`https://crowdfunding-vxjp.onrender.com/api/produto/com-arrecadacao`, {
        headers: {
          "Content-Type": "application/json"          
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar produtos.");
      }

      const data = await response.json();
      console.log("Todos os produtos carregados:", data);
      
      const produtosArray = Array.isArray(data) ? data : [data].filter(Boolean);
      setTodosProdutos(produtosArray);
      setProdutos(produtosArray);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setErro('Erro ao carregar produtos');
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    let produtosFiltrados = [...todosProdutos];

    if (termoBusca) {
      produtosFiltrados = produtosFiltrados.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }

    if (categoriaFiltro) {
      produtosFiltrados = produtosFiltrados.filter(produto =>
        produto.categoria?.nome.toLowerCase() === categoriaFiltro.toLowerCase()
      );
    }

    setProdutos(produtosFiltrados);
  };

  const limparFiltros = () => {
    navigate('/', { replace: true });
  };

  const temFiltrosAtivos = termoBusca || categoriaFiltro;

  if (carregando) {
    return (
      <Container className="my-4">
        <div className="text-center">
          <h3>Carregando...</h3>
        </div>
      </Container>
    );
  }

  const calcularProgresso = (produto: Produto) => {
    if (!produto.valor_meta || produto.valor_meta === 0) return 0;
    if (!produto.valor_arrecadado) return 0;
    return Math.min((produto.valor_arrecadado / produto.valor_meta) * 100, 100);
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const metaAtingida = (produto: Produto) => {
    return calcularProgresso(produto) >= 100;
  };

  return (
    <Container className="my-4">
      {temFiltrosAtivos && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                {termoBusca && `Busca: "${termoBusca}"`}
                {termoBusca && categoriaFiltro && ' | '}
                {categoriaFiltro && `Categoria: ${categoriaFiltro}`}
              </h2>
              <p className="text-muted">
                {produtos.length} {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>
            <Button 
              variant="outline-secondary" 
              onClick={limparFiltros}
            >
              ✕ Limpar Filtros
            </Button>
          </div>
        </div>
      )}
      {!temFiltrosAtivos && (
        <h2 className="mb-4">Todos os Produtos</h2>
      )}

      {erro && (
        <Alert variant="danger" className="mb-4">
          {erro}
        </Alert>
      )}

      {produtos.length === 0 && !carregando ? (
        <div className="text-center py-5">
          <h4>Nenhum produto encontrado</h4>
          <p className="text-muted">
            {temFiltrosAtivos 
              ? `Não encontramos produtos ${
                  termoBusca ? `para "${termoBusca}"` : ''
                }${
                  termoBusca && categoriaFiltro ? ' na ' : ''
                }${
                  categoriaFiltro ? `categoria "${categoriaFiltro}"` : ''
                }. Tente outros termos.`
              : 'Não há produtos cadastrados no momento.'
            }
          </p>
          {temFiltrosAtivos && (
            <Button 
              variant="primary" 
              onClick={limparFiltros}
            >
              Ver todos os produtos
            </Button>
          )}
        </div>
      ) : (
        <Row>
          {produtos.map((produto) => (
            <Col key={produto.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 card-produto">
                {produto.imagem_capa && (
                  <Card.Img 
                    variant="top" 
                    src={produto.imagem_capa} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  {produto.categoria && (
                    <div className="mb-2">
                      <span className="badge bg-primary">{produto.categoria.nome}</span>
                    </div>
                  )}
                  
                  <Card.Title>{produto.nome}</Card.Title>
                  <Card.Text className="flex-grow-1">
                    {produto.descricao && produto.descricao.length > 100 
                      ? `${produto.descricao.substring(0, 100)}...` 
                      : produto.descricao
                    }
                  </Card.Text>
                  
                  <div className="mt-auto">
                    {produto.valor_meta && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">
                            Arrecadado: R$ {formatarValor(produto.valor_arrecadado || 0)}
                          </small>
                          <small className="text-muted">
                            Meta: R$ {formatarValor(produto.valor_meta)}
                          </small>
                        </div>
                        <ProgressBar 
                          now={calcularProgresso(produto)} 
                          variant={metaAtingida(produto) ? "success" : "primary"}
                          style={{ height: '8px' }}
                        />
                        <div className="text-center mt-1">
                          <small className="text-muted">
                            {calcularProgresso(produto).toFixed(1)}% da meta
                            {metaAtingida(produto) && " 🎉"}
                          </small>
                        </div>
                      </div>
                    )}
                    
                    <div className="d-grid">
                      <Link to={`/apoio/${produto.id}`}>
                        <Button 
                          variant={metaAtingida(produto) ? "success" : "primary"} 
                          className="w-100"
                          disabled={metaAtingida(produto)}
                        >
                          {metaAtingida(produto) ? "🎉 Meta Atingida!" : "Apoiar"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <div className="text-center mt-4">
        <Link to="/cadastroProduto">
          <Button variant="success">
            Cadastrar Novo Produto
          </Button>
        </Link>
      </div>
    </Container>
  );
}

export default ListaProdutos;