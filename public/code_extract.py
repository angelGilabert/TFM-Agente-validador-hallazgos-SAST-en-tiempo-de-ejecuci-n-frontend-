
import ast

 
# Resultado genérico: ['username', 'password']
 def find_request_keys(code_snippet):

tree = ast.parse(code_snippet)

keys = []

for node in ast.walk(tree):

# Busca llamadas a .get('algo')

if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):

if node.func.attr == 'get' and node.args:

if isinstance(node.args[0], ast.Constant):

keys.append(node.args[0].value)

return list(set(keys)) 


def obtener_bloque_codigo(ruta_archivo, num_linea):
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            lineas = f.readlines()

        error_line=""
        post_line=""
        
        indice_actual = num_linea - 1

        codigo = []
        for i in range(indice_actual, -1, -1):
            if len(error_line) == 0:
                error_line = lineas[i]
            
            linea = lineas[i]
            codigo.append(linea)
            
            if linea.lstrip().startswith('@'):
                post_line = linea
                break
        
        # Se invierte el orden
        result = "".join(codigo[::-1])
        
        
        print("error:" + error_line)
        print("post:" + post_line)
        # .join une la lista en un solo string
        return result

    except FileNotFoundError:
        return "Error: No se encontró el archivo en esa ruta."


ruta = "/home/angel/VSProjects/vulnApp2/app.py"
linea= 189

print(obtener_bloque_codigo(ruta, linea))

