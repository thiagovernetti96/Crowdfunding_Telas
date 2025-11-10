import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Button, Form, InputGroup } from "react-bootstrap";
import '../Produto/CadastroProduto.css'

type Usuario = { id: number; nome: string };
type Categoria = { id: number; nome: string };

function CadastroProduto() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produto, setProduto] = useState({
    usuarioId: 0,
    categoriaId: 0,
    descricao: "",
    valor_meta: 0,
    nome: "",
  });
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string>("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Usuário não autenticado!");
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      console.log("TOKEN DECODED:", decoded);

      const user = {
        id: decoded.id || decoded.usuarioId || decoded.sub, 
        nome: decoded.nome || decoded.name || decoded.username,
      };

      if (!user.id) {
        console.error("⚠️ ID do usuário não encontrado no token!");
        return;
      }

      setUsuarioLogado(user);
      setProduto((prev) => ({ ...prev, usuarioId: user.id }));

      // Busca categorias da API
      fetch("http://localhost:3000/api/categoria")
        .then((res) => res.json())
        .then((data) => setCategorias(data))
        .catch((err) => console.error("Erro ao buscar categorias:", err));
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
    }
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagem(file);

      // Cria preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImagem(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioLogado) {
      alert("Usuário não identificado!");
      return;
    }

    if (produto.categoriaId === 0) {
      alert("Por favor, selecione uma categoria!");
      return;
    }

    if (!imagem) {
      alert("Por favor, selecione uma imagem para o produto!");
      return;
    }

    // Criar FormData para enviar arquivo
    const formData = new FormData();
    formData.append('nome', produto.nome);
    formData.append('descricao', produto.descricao);
    formData.append('categoriaId', produto.categoriaId.toString());
    formData.append('criadorId', usuarioLogado.id.toString());
    formData.append('valor_meta', produto.valor_meta.toString());
    
    if (imagem) {
      formData.append('imagem_capa', imagem);
    }

    try {
      const response = await fetch("http://localhost:3000/api/produto", {
        method: "POST",
        headers: {
          "Token": token || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const erroTexto = await response.text();
        console.error("Erro no backend:", erroTexto);
        throw new Error("Erro ao salvar produto");
      }

      const produtoSalvo = await response.json();
      console.log("Produto salvo:", produtoSalvo);

      alert("✅ Produto salvo com sucesso!");
      
      setProduto({
        usuarioId: usuarioLogado.id,
        descricao: "",
        categoriaId: 0,
        valor_meta: 0,
        nome: "",
      });
      setImagem(null);
      setPreviewImagem("");
      
      // Limpa input de arquivo
      const fileInput = document.getElementById('imagem_capa') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto");
    }
  };

  if (!usuarioLogado) return <div>Carregando usuário...</div>;

  return (
    <div className="container-cadastro">
      <form onSubmit={handleSubmit} className="cadastroForm">
        <h2>Cadastro de Produto</h2>

        <div className="form-group">
          <InputGroup className="mb-3" size="lg">
            <InputGroup.Text>Categoria:</InputGroup.Text>
            <Form.Control
              as="select"
              value={produto.categoriaId}
              onChange={(e) =>
                setProduto({ ...produto, categoriaId: parseInt(e.target.value) })
              }
              required
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
              rows={3}
              value={produto.descricao}
              onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
              required
            />
          </InputGroup>

          <InputGroup className="mb-3" size="lg">
            <InputGroup.Text>Valor da Meta R$:</InputGroup.Text>
            <Form.Control
              type="text"
              step="0.01"
              min="0"
              value={produto.valor_meta}
              onChange={(e) =>
                setProduto({ ...produto, valor_meta: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </InputGroup>

          <InputGroup className="mb-3" size="lg">
            <InputGroup.Text>Imagem do Produto:</InputGroup.Text>
            <Form.Control
              id="imagem_capa"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </InputGroup>

          {/* Preview da imagem */}
          {previewImagem && (
            <div className="mb-3">
              <InputGroup.Text>Preview:</InputGroup.Text>
              <div className="image-preview">
                <img 
                  src={previewImagem} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    marginTop: '10px',
                    borderRadius: '8px'
                  }} 
                />
              </div>
            </div>
          )}
        </div>

        <Button variant="primary" type="submit" className="d-block m-auto" size="lg">
          Cadastrar Produto
        </Button>
      </form>
    </div>
  );
}

export default CadastroProduto;