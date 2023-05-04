from typing import Optional
from typing_extensions import TypedDict
import textwrap
import nbformat as nbf

class GetTemplateArgs(TypedDict):
    note_title: str
    note_tags: str

def get_template_basic(params) -> str:
    nb = nbf.v4.new_notebook()
    cells = []
    text = textwrap.dedent("""\
    ---
    tags: {note_tags}
    title: {note_title}
    ---

    [toc]

    # {note_title} \
    """).format(**params)
    cells.append(nbf.v4.new_markdown_cell(text))

    text = textwrap.dedent("""\
    # References
    """)
    cells.append(nbf.v4.new_markdown_cell(text))
    nb.cells = cells
    return nbf.writes(nb)

def get_template(params: GetTemplateArgs, template_name: Optional[str]=None) -> str:
    if template_name is None or template_name == "basic":
        return get_template_basic(params)
    else:
        raise Exception("Not a supported template name")