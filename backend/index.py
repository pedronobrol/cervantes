from flask import Flask, request, jsonify
import os
import fitz  # PyMuPDF

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 10MB limit

try:
    path = os.path.dirname(os.path.abspath(__file__))
    upload_folder=os.path.join(
    path.replace('/files',''),'tmp')
    os.makedirs(upload_folder, exist_ok=True)
    app.config['upload_folder'] = upload_folder
except Exception as e:
    app.logger.info('An error occurred while creating temp folder')
    app.logger.error(f'Exception occurred : {e}')

def extract_html_method(pdf_file, start_page = 0):
    doc = fitz.open(pdf_file)
    doc_list = list(doc)[start_page:]
    parsed_doc = []

    for page in doc_list:
        html_content = page.get_text('html')
        parsed_doc.append(html_content)

    result = {"pages": parsed_doc, "page_count": len(parsed_doc)}
    doc.close()
    return result

@app.route('/ok', methods=['GET'])
def test():
    return jsonify({'message': 'ok!'})
    
@app.route('/extract_html', methods=['POST'])
def extract_html():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        pdf_name = file.filename
        save_path = os.path.join(
        app.config.get('upload_folder'),pdf_name)
        file.save(save_path)
        words_data = extract_html_method(save_path)
        os.remove(save_path)
        return jsonify(words_data)

if __name__ == '__main__':
    app.run(host= '0.0.0.0', port="33", debug=True)
