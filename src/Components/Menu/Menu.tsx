import './Menu.css';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { InputGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

function Menu() {
  const { isAuthenticated, nome, logout } = useAuth();
  const [termoBusca, setTermoBusca] = useState('');
  const navigate = useNavigate();

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/?buscaporNome=${encodeURIComponent(termoBusca)}`);
    }
  };

  return (
    <div className='menu'>
      <Link to="/"><h1>Crowdfunding</h1></Link>

      <form className='search-form' onSubmit={handleBusca}>
        <InputGroup size='lg' className='searchgroup'>
          <InputGroup.Text>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Busque Produtos"
            aria-label="Busque Produtos"
            aria-describedby="basic-addon1"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </InputGroup>
      </form>

      <div className="menu-buttons">
        {isAuthenticated ? (
          <>
            <span className="nome-usuario mt-3">Olá, {nome}</span>
            <Link to="/meusProdutos">
              <Button variant="outline-primary p-2 m-2">Meus Produtos</Button>
            </Link>
            <Button variant="danger" className='' onClick={logout}>Logout</Button>
          </>
        ) : (
          <Link to="/login">
            <Button variant="success">Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Menu;
