TITLE = "Data Class: Product"

DESCRIPTION = """
Define a Product data class with a name, unit_price, and quantity. Add a
total_value() method that returns unit_price * quantity.

Create each Product with its three values. A data class should provide the
initializer for you; focus on the fields and the method.

Example:
    product = Product("Notebook", 3.50, 4)
    product.total_value()  # 14.0
"""

CONSTRAINTS = """
- name is a string
- unit_price is a non-negative number
- quantity is a non-negative integer
"""

CLASS_NAME = "Product"

SIGNATURE = '''from dataclasses import dataclass

# Define Product as a data class with the fields and method from the prompt.'''

CASES = [
    (("Notebook", 3.5, 4), [
        ("total_value", (), 14.0),
    ]),
    (("Pen", 1.25, 0), [
        ("total_value", (), 0.0),
    ]),
    (("Desk", 125.0, 2), [
        ("total_value", (), 250.0),
    ]),
]
