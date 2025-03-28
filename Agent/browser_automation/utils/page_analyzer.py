"""
Utilities for analyzing page state and content.
"""
import logging

logger = logging.getLogger(__name__)

def get_page_state(page):
    """
    Get current page state including HTML and relevant JavaScript state.
    
    Args:
        page: Playwright page object
        
    Returns:
        dict: Page state information
    """
    try:
        # Get HTML content
        html_content = page.content()
        
        # Get page URL
        current_url = page.url
        
        # Check for iframes
        iframe_count = page.evaluate('() => document.querySelectorAll("iframe").length')
        
        # Get any visible text that might be useful
        visible_text = page.evaluate('() => document.body.innerText')
        
        # Get detailed element information including visibility state
        element_details = page.evaluate('''() => {
            function getElementDetails(elements) {
                return Array.from(elements).map(el => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    const isVisible = rect.width > 0 && rect.height > 0 && 
                                    computedStyle.display !== 'none' && 
                                    computedStyle.visibility !== 'hidden' &&
                                    computedStyle.opacity !== '0';
                    
                    return {
                        tag: el.tagName.toLowerCase(),
                        id: el.id,
                        name: el.name,
                        classes: Array.from(el.classList),
                        text: el.innerText?.trim(),
                        placeholder: el.placeholder,
                        value: el.value,
                        type: el.type,
                        attributes: Array.from(el.attributes).reduce((obj, attr) => {
                            obj[attr.name] = attr.value;
                            return obj;
                        }, {}),
                        isVisible: isVisible,
                        isHidden: !isVisible,
                        position: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        }
                    };
                });
            }
            
            // Get all input elements (visible and hidden)
            const allInputs = document.querySelectorAll('input, select, textarea');
            
            // Get all interactive elements
            const interactiveElements = document.querySelectorAll('button, a, [role="button"], [role="checkbox"], [role="radio"]');
            
            // Get iframe information
            const iframes = Array.from(document.querySelectorAll('iframe')).map(iframe => ({
                id: iframe.id,
                name: iframe.name,
                src: iframe.src,
                position: iframe.getBoundingClientRect()
            }));
            
            return {
                inputs: getElementDetails(allInputs),
                interactive: getElementDetails(interactiveElements),
                iframes: iframes
            };
        }''')
        
        return {
            'html': html_content,
            'url': current_url,
            'text': visible_text,
            'elements': element_details,
            'has_iframes': iframe_count > 0,
            'iframe_count': iframe_count
        }
    except Exception as e:
        logger.error(f"Error getting page state: {e}")
        return None

def extract_page_summary(page_state):
    """
    Extract a concise summary of the page state for AI prompting.
    
    Args:
        page_state: Full page state dictionary
        
    Returns:
        str: Summarized page state
    """
    if not page_state:
        return "No page state available"
    
    summary = [
        f"Current URL: {page_state['url']}",
        "\nClickable Elements:",
    ]
    
    if page_state.get('clickable'):
        for i, element in enumerate(page_state['clickable'][:10]):  # Limit to first 10
            summary.append(f"  {i+1}. {element['tag']} - Text: '{element['text']}', ID: '{element['id']}', Role: '{element['role']}'")
    
    summary.append("\nForm Elements:")
    if page_state.get('forms'):
        for i, form in enumerate(page_state['forms']):
            summary.append(f"  Form {i+1}:")
            for input_el in form['inputs']:
                summary.append(f"    - {input_el['type']} input, Name: '{input_el['name']}', ID: '{input_el['id']}', Placeholder: '{input_el['placeholder']}'")
    
    # Add a truncated version of the visible text
    if page_state.get('text'):
        text_preview = page_state['text'][:500] + "..." if len(page_state['text']) > 500 else page_state['text']
        summary.append(f"\nVisible Text Preview:\n{text_preview}")
    
    return "\n".join(summary)