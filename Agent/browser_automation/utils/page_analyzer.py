"""
Utilities for analyzing page state and content.
"""
import logging
from bs4 import BeautifulSoup

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
                        type: el.type,
                        value: el.value,
                        placeholder: el.placeholder,
                        href: el.href,
                        src: el.src,
                        alt: el.alt,
                        text: el.innerText,
                        isVisible: isVisible,
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                        attributes: (() => {
                            const attrs = {};
                            for (const attr of el.attributes) {
                                attrs[attr.name] = attr.value;
                            }
                            return attrs;
                        })()
                    };
                });
            }
            
            // Get interactive elements
            const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
            
            return {
                interactiveElements: getElementDetails(interactiveElements),
                formElements: getElementDetails(document.querySelectorAll('form, input, select, textarea')),
                navigationElements: getElementDetails(document.querySelectorAll('nav, [role="navigation"], header, footer'))
            };
        }''')
        
        # Parse HTML with BeautifulSoup for additional analysis
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract form information
        forms = []
        for form in soup.find_all('form'):
            form_info = {
                'id': form.get('id', ''),
                'action': form.get('action', ''),
                'method': form.get('method', 'get'),
                'inputs': []
            }
            
            for input_el in form.find_all(['input', 'select', 'textarea']):
                input_info = {
                    'type': input_el.get('type', 'text') if input_el.name == 'input' else input_el.name,
                    'name': input_el.get('name', ''),
                    'id': input_el.get('id', ''),
                    'placeholder': input_el.get('placeholder', ''),
                    'required': input_el.has_attr('required'),
                    'value': input_el.get('value', '')
                }
                form_info['inputs'].append(input_info)
            
            forms.append(form_info)
        
        # Extract navigation elements
        navigation = []
        for nav in soup.find_all(['nav', 'header']):
            nav_links = []
            for link in nav.find_all('a'):
                nav_links.append({
                    'text': link.text.strip(),
                    'href': link.get('href', ''),
                    'id': link.get('id', ''),
                    'class': ' '.join(link.get('class', []))
                })
            
            navigation.append({
                'type': nav.name,
                'id': nav.get('id', ''),
                'class': ' '.join(nav.get('class', [])),
                'links': nav_links
            })
        
        # Return comprehensive page state
        return {
            'html_content': html_content,
            'url': current_url,
            'iframe_count': iframe_count,
            'visible_text': visible_text,
            'element_details': element_details,
            'forms': forms,
            'navigation': navigation,
            'title': soup.title.text if soup.title else '',
            'meta_description': soup.find('meta', attrs={'name': 'description'}).get('content', '') if soup.find('meta', attrs={'name': 'description'}) else ''
        }
    except Exception as e:
        logger.error(f"Error getting page state: {e}")
        return {
            'error': str(e),
            'url': page.url if page else 'Unknown'
        }

def extract_page_summary(page_state):
    """
    Extract a summary of the page state for use in prompts.
    
    Args:
        page_state: Page state dictionary
        
    Returns:
        str: Summary of the page state
    """
    if not page_state:
        return "No page state available"
    
    if 'error' in page_state:
        return f"Error getting page state: {page_state['error']}"
    
    # Use BeautifulSoup for better HTML analysis if available
    summary_parts = []
    
    # Basic page info
    summary_parts.append(f"URL: {page_state.get('url', 'Unknown')}")
    summary_parts.append(f"Title: {page_state.get('title', 'Unknown')}")
    
    # Add iframe information
    iframe_count = page_state.get('iframe_count', 0)
    if iframe_count > 0:
        summary_parts.append(f"Page contains {iframe_count} iframes")
    
    # Summarize forms
    forms = page_state.get('forms', [])
    if forms:
        form_summary = []
        for i, form in enumerate(forms):
            form_summary.append(f"Form {i+1}: ID='{form['id']}', Action='{form['action']}', Method='{form['method']}'")
            for input_el in form['inputs'][:5]:  # Limit to first 5 inputs
                form_summary.append(f"  - {input_el['type']} input: name='{input_el['name']}', id='{input_el['id']}'")
            if len(form['inputs']) > 5:
                form_summary.append(f"  - ... and {len(form['inputs']) - 5} more inputs")
        summary_parts.append("Forms:\n" + "\n".join(form_summary))
    
    # Summarize navigation
    navigation = page_state.get('navigation', [])
    if navigation:
        nav_summary = []
        for nav in navigation:
            nav_summary.append(f"Navigation ({nav['type']}): ID='{nav['id']}', Class='{nav['class']}'")
            for link in nav['links'][:5]:  # Limit to first 5 links
                nav_summary.append(f"  - Link: '{link['text']}' -> {link['href']}")
            if len(nav['links']) > 5:
                nav_summary.append(f"  - ... and {len(nav['links']) - 5} more links")
        summary_parts.append("Navigation:\n" + "\n".join(nav_summary))
    
    # Summarize interactive elements
    if 'element_details' in page_state and 'interactiveElements' in page_state['element_details']:
        interactive = page_state['element_details']['interactiveElements']
        if interactive:
            interactive_summary = []
            for i, el in enumerate(interactive[:10]):  # Limit to first 10 elements
                el_text = el.get('text', '')[:30]
                el_text = f"'{el_text}...'" if el_text else "No text"
                interactive_summary.append(f"  - {el['tag']}: {el_text} (ID='{el['id']}', Type='{el['type']}', Visible={el['isVisible']})")
            if len(interactive) > 10:
                interactive_summary.append(f"  - ... and {len(interactive) - 10} more interactive elements")
            summary_parts.append("Interactive Elements:\n" + "\n".join(interactive_summary))
    
    return "\n\n".join(summary_parts)