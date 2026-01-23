import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem } from 'rc-menu';
import 'rc-dropdown/assets/index.css';
import 'rc-menu/assets/index.css';
import './dropdown.css';

/**
 * Componente de Dropdown personalizado.
 * * @param {Object} props - Propiedades del componente.
 * @param {string} props.actual_state - El valor actualmente seleccionado.
 * @param {Function} props.setState - Función para actualizar el estado.
 * @param {Array} props.states - Lista de valores de las opciones.
 * @param {Array|null} [props.name_states] Etiquetas para mostrar al usuario.
 */
export function CustomeDropdown({ actual_state, setState, states, name_states = null }) {

    const handleSelect = ({ key }) => {
        setState(key);
    };

    const menu = (
        <Menu onClick={handleSelect} className="custom-menu">
            {states.map((state, i) => (
                <MenuItem key={state} className="custom-dropdown-item">
                    {name_states ? name_states[i] : state}
                </MenuItem>
            ))}
        </Menu>
    );

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            <Dropdown overlay={menu} trigger={['click']} animation="slide-up">
                <button className="custom-dropdown-trigger">
                    {name_states ? name_states[states.indexOf(actual_state)] : actual_state}
                    <span className="dropdown-arrow">▼</span>
                </button>
            </Dropdown>
        </div>
    );
}