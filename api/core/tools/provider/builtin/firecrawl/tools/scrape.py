from typing import Any, Union

from core.tools.entities.tool_entities import ToolInvokeMessage
from core.tools.provider.builtin.firecrawl.firecrawl_appx import FirecrawlApp
from core.tools.tool.builtin_tool import BuiltinTool


class CrawlTool(BuiltinTool):
    def _invoke(self, user_id: str, tool_parameters: dict[str, Any]) -> Union[ToolInvokeMessage, list[ToolInvokeMessage]]:
        # initialize the app object with the api key
        app = FirecrawlApp(api_key=self.runtime.credentials['firecrawl_api_key'], base_url=self.runtime.credentials['base_url'])

        options = {
            'pageOptions': {
                'onlyMainContent': tool_parameters.get('onlyMainContent', False)
            }
        }

        # scrape the url
        scrape_result = app.scrape_url(
            url=tool_parameters['url'], 
            params=options
        )
        
        # reformat scrape result
        scrape_output = "**Scrape Result**\n\n"
        try:
            scrape_output += f"**- Title:** {scrape_result.get('metadata', {}).get('title', '')}\n"
            scrape_output += f"**- Description:** {scrape_result.get('metadata', {}).get('description', '')}\n"
            scrape_output += f"**- URL:** {scrape_result.get('metadata', {}).get('ogUrl', '')}\n\n"
            scrape_output += f"**- Web Content:**\n{scrape_result.get('markdown', '')}\n\n"
            scrape_output += "---\n\n"
        except Exception as e:
            scrape_output += f"An error occurred: {str(e)}\n"
            scrape_output += f"**- Title:** {result.get('metadata', {}).get('title', '')}\n"
            scrape_output += f"**- Description:** {result.get('metadata', {}).get('description','')}\n"
            scrape_output += f"**- URL:** {result.get('metadata', {}).get('ogUrl', '')}\n\n"
            scrape_output += f"**- Web Content:**\n{result.get('markdown', '')}\n\n"
            scrape_output += "---\n\n"


        return self.create_text_message(scrape_output)
