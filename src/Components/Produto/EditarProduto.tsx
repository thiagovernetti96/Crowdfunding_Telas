import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, InputGroup } from "react-bootstrap";
import '../Produto/CadastroProduto.css'


type Categoria={
  nome:string,
  id:number
  
}


function EditarProduto() {


  const{id}= useParams<{id:string}>();

  const[produto,setProduto] = useState({
    nome:'',
    descricao:'',
    valor_meta:0,
    categoriaId:0,
    imagem_capa:'',
    usuarioId:0
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const fetchProduto = async () => {
      const token = localStorage.getItem('token');
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Token"] = token;
        }

        const response = await fetch(`https://crowdfunding-vxjp.onrender.com/api/produto/${id}`, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar produto');
        }

        const produtoData = await response.json();
        setProduto(produtoData);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      }
    };
    fetchProduto();
  }, [id]);

  try{
    fetch("https://crowdfunding-vxjp.onrender.com/api/categoria")
    .then((res)=>res.json())
    .then((data)=>setCategorias(data))
    .catch((err)=>console.error("Erro ao buscar categorias:",err));

  }
  catch(error){
    console.error("Erro ao buscar as categorias:",error);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://crowdfunding-vxjp.onrender.com/api/produto/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Token": token ?? ""
        },
        body: JSON.stringify(produto)
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar o produto." + response.status);
      }
       alert("Produto atualizado com sucesso!");
    }catch (error) {
        console.error(error);
      } 
  };

  return (
    <div className="container-cadastro">
    <form onSubmit={handleSubmit} className="cadastroForm">
      <h2>Cadastro de Produto</h2>

      <div className="form-group">
        
        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text>
            Categoria:
          </InputGroup.Text>
          <Form.Control
            as="select"
            value={produto.categoriaId}
            onChange={(e) =>
              setProduto({ ...produto, categoriaId: parseInt(e.target.value) })
            }
          >
            <option value={0}>Selecione uma categoria...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Form.Control>
        </InputGroup>
        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text>Nome do Produto:</InputGroup.Text>
          <Form.Control
            type="text"
            value={produto.nome}
            onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
            required
          />
        </InputGroup>
        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text>Descrição:</InputGroup.Text>
          <Form.Control
            as="textarea"
            value={produto.descricao}
            onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
            required
          />
        </InputGroup>
        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text>Valor da Meta:</InputGroup.Text>
          <Form.Control
            type="text"
            step="0.01"
            min="0"
            value={produto.valor_meta}
            onChange={(e) =>
              setProduto({ ...produto, valor_meta: parseFloat(e.target.value) })
            }
            required
          />
        </InputGroup>
        <InputGroup className="mb-3" size="lg">
          <InputGroup.Text>Imagem Capa (URL):</InputGroup.Text>
          <Form.Control
            type="text"
            value={produto.imagem_capa}
            onChange={(e) =>
              setProduto({ ...produto, imagem_capa: e.target.value })
            }
          />
        </InputGroup>
      </div>
      <Button variant="primary" type="submit">
        Editar Produto
      </Button>
    </form>
    </div>
  );
}  



export default EditarProduto;