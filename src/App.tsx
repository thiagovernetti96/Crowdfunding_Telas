
import Menu from '../src/Components/Menu/Menu'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login  from './Components/Login/Login';
import CadastroUsuario from './Components/Usuario/CadastroUsuario';
import CadastroProduto from './Components/Produto/CadastroProduto';
import { ProtectedRoute } from "./ProtectedRoute"
import { AuthProvider } from "./hooks/useAuth";
import Categorias from './Components/Categorias/Categorias';
import Apoio from './Components/Apoio/Apoio';
import ListaProdutos from './Components/Produto/ListaProduto';
import EditarProduto from './Components/Produto/EditarProduto';
import MeusProdutos from './Components/Usuario/MeusProdutos';

function App() {
  return (
    <Router>
           
      <AuthProvider>
      <Menu/>
      <Routes>
        <Route path='/' element={
           <>
           <Categorias/>
           <ListaProdutos/>
           </>
        }/>
        <Route path='/cadastroUsuario' element={<CadastroUsuario/>}/>
        <Route path="/login" element={<Login />} />
        <Route path='/cadastroProduto' element={ <ProtectedRoute><CadastroProduto /></ProtectedRoute>}/>
        <Route path='/meusProdutos/' element={ <ProtectedRoute><MeusProdutos /></ProtectedRoute>}/>
        <Route path='/editarProduto/:id' element={ <ProtectedRoute><EditarProduto /></ProtectedRoute>}/>
        <Route path='/apoio/:id' element={<ProtectedRoute><Apoio /></ProtectedRoute>}/>
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
