/*
 Copyright 2025 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
//***********************************************************//
// Loan Risk - AI Agent
// LangGraph - single AI agent with LLM and tools
// Author: Anuj Jain (jainanuj@us.ibm.com)
//***********************************************************//

import express, { Application, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
const __dirname = path.dirname('.'); // get the name of the directory

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { StateGraph, END,  START} from "@langchain/langgraph";
import { MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

import { ChatOpenAI } from "@langchain/openai";


/////////////////////////////////

//Preconfigured environment variables
process.env.APPLICATION_NAME="LoanRisk-AIAgent";
process.env.IBM_IAM_TOKEN_ENDPOINT="https://iam.cloud.ibm.com/identity/token"

//Optional local overrides
//process.env.APPLICATION_PORT="8080";
//process.env.APPLICATION_HOST="127.0.0.1";
//process.env.LITELLM_BASE_URL="http://127.0.0.1:4000/v1";
//process.env.LITELLM_API_KEY="sk-local";
//process.env.LITELLM_MODEL="loan-risk-bedrock";

//Optional - For using RAG LLM set rag llm watsonx environment variables to set in deployment
//process.env.ENABLE_RAG_LLM = "true" //default is false. true requires WATSONX_RISK_RAG_LLM_ENDPOINT; 
//process.env.WATSONX_RISK_RAG_LLM_ENDPOINT="https://private.us-south.ml.cloud.ibm.com/ml/v4/deployments/xxx-xxx-xxx-xxx-xxx/ai_service?version=2021-05-01";

//Optional - For using watsonx Assistant. Creates a /wx.html webpage with the chat widget
//process.env.ENABLE_WXASST="true" //default is false. true requires the other WXASST_ variables. These are available in the Embed script of the watsonx assistant
//process.env.WXASST_INTEGRATION_ID="xxx-xxx-xxx-xx-xx"
//process.env.WXASST_REGION="xx-xxx" 
//process.env.WXASST_SERVICE_INSTANCE_ID="xxx-xxxx-xxx-xx-x"

//environment variables set by functions in the code
//process.env.IBM_IAM_TOKEN="to be set by function"
//process.env.IBM_IAM_TOKEN_EXPIRATION="to be set by function"

//Validate the environment variables. Set defaults when not provided.
if (process.env.APPLICATION_PORT) {
  console.log("Setting process.env.APPLICATION_PORT from envars:", process.env.APPLICATION_PORT);
} else {
  process.env.APPLICATION_PORT="8080";
  console.log("Using default process.env.APPLICATION_PORT:", process.env.APPLICATION_PORT);
}

if (process.env.APPLICATION_HOST) {
  console.log("Setting process.env.APPLICATION_HOST from envars:", process.env.APPLICATION_HOST);
} else {
  process.env.APPLICATION_HOST="127.0.0.1";
  console.log("Using default process.env.APPLICATION_HOST:", process.env.APPLICATION_HOST);
}

if (process.env.LITELLM_BASE_URL) {
  console.log("Setting process.env.LITELLM_BASE_URL from envars:", process.env.LITELLM_BASE_URL);
} else {
  process.env.LITELLM_BASE_URL="http://127.0.0.1:4000/v1";
  console.log("Using default process.env.LITELLM_BASE_URL:", process.env.LITELLM_BASE_URL);
}

if (process.env.LITELLM_API_KEY) {
  console.log("Using process.env.LITELLM_API_KEY from envars.");
} else {
  process.env.LITELLM_API_KEY="sk-local";
  console.log("Using a local placeholder process.env.LITELLM_API_KEY.");
}

if (process.env.LITELLM_MODEL) {
  console.log("Setting process.env.LITELLM_MODEL from envars:", process.env.LITELLM_MODEL);
} else {
  process.env.LITELLM_MODEL="loan-risk-bedrock";
  console.log("Using default process.env.LITELLM_MODEL:", process.env.LITELLM_MODEL);
}

if (process.env.ENABLE_RAG_LLM) {
  console.log("Using process.env.ENABLE_RAG_LLM from envars:", process.env.ENABLE_RAG_LLM);
  if (process.env.ENABLE_RAG_LLM.toLowerCase()==='true') {
    console.log("IBM-hosted RAG is enabled and requires WATSONX_RISK_RAG_LLM_ENDPOINT and WATSONX_AI_APIKEY.");
    if (!process.env.WATSONX_RISK_RAG_LLM_ENDPOINT || !process.env.WATSONX_AI_APIKEY) {
      throw new Error("ENABLE_RAG_LLM=true requires WATSONX_RISK_RAG_LLM_ENDPOINT and WATSONX_AI_APIKEY.");
    }
  }
} else {
  process.env.ENABLE_RAG_LLM="false";
  console.log("Using default process.env.ENABLE_RAG_LLM:", process.env.ENABLE_RAG_LLM);
}

if (process.env.ENABLE_WXASST) {
  if (process.env.ENABLE_WXASST.toLowerCase()==='true') {
    console.log("Setting up watsonx Assistant widget for page /wx.html. Envar ENABLE_WXASST:", process.env.ENABLE_WXASST);
    if (process.env.WXASST_INTEGRATION_ID && process.env.WXASST_REGION && process.env.WXASST_SERVICE_INSTANCE_ID) {
      fs.readFile('public/wx-template.html', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result1 = data.replace('[[[WXASST_INTEGRATION_ID]]]', process.env.WXASST_INTEGRATION_ID );
        var result2 = result1.replace('[[[WXASST_REGION]]]', process.env.WXASST_REGION );
        var result3 = result2.replace('[[[WXASST_SERVICE_INSTANCE_ID]]]', process.env.WXASST_SERVICE_INSTANCE_ID );

        fs.writeFile('public/wx.html', result3, 'utf8', function (err) {
          if (err) return console.log(err);
        });
      });
      fs.readFile('public/wx-template2.html', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result1 = data.replace('[[[WXASST_INTEGRATION_ID]]]', process.env.WXASST_INTEGRATION_ID );
        var result2 = result1.replace('[[[WXASST_REGION]]]', process.env.WXASST_REGION );
        var result3 = result2.replace('[[[WXASST_SERVICE_INSTANCE_ID]]]', process.env.WXASST_SERVICE_INSTANCE_ID );

        fs.writeFile('public/wx-detailed.html', result3, 'utf8', function (err) {
          if (err) return console.log(err);
        });
      });
    } else {
      console.log("Unable to set up watsonx Assistant widget. Missing one or more envars from WXASST_INTEGRATION_ID, WXASST_REGION, WXASST_SERVICE_INSTANCE_ID,");
    }
  }
}


const agentic_instructions = {
  credit_score_tool:'Get the credit score for the customer using the customer id. Customer\'s name can be used instead of customer\'s id. If the credit score is already known do not retrieve again.', 
  account_status_tool: 'Get the account status for the customer using customer id. Customer\'s name can be used instaed of customer\'s id. If the account status is already known do not retrieve again.',
  overall_risk_tool: 'Get overall risk based on combination of both credit score and account status. Explain how the overall risk was calculated. If the credit score and account status are not known then do not provide the risk status and first retrieve the missing credit score or account status.',
  overall_risk_from_rag_llm_tool: 'Get overall risk based on combination of both credit score and account status. Explain how the overall risk was calculated. If the credit score and account status are not known then do not provide the risk status and first retrieve the missing credit score or account status.',
  overall_risk_from_rag_llm_tool_prompt: "what is the risk for credit score {credit_score} and account status {account_status}, and how is it determined?",
  interest_rate_tool: 'Get interest rate percentage based on overall risk. Explain how the interest rate was determined. If the overall risk is not known then do not provide the interest rate status and first retrieve the overall risk.',
  interest_rate_from_rag_llm_tool_prompt: "what is the interest rate for overall risk {overall_risk} and how was it determined?",
  interest_rate_from_rag_llm_tool: 'Get interest rate percentage based on overall risk. If the overall risk is not known then do not provide the interest rate status and first retrieve the overall risk. Explain how the interest rate was determined.',
   
  //NOTE: Also - tbd -- There are additional descriptions for the tool input argumets that impact tool use. 
  //eg schema: z.object({ customer_id: z.string().describe("Customer's id"),

  model_temperature: 0,
  model_maxTokens: 500
}

const agentSystemPrompt =
  "You are a loan-risk assistant. Use the available tools when required. After a tool returns a result, either call a different tool that is still required or answer the user using the result. Never repeat the same tool call with the same arguments.";

/////////////////////////////////

const webapp: Application = express();

// Serve static files from the 'public' directory
webapp.use(express.static(path.join(__dirname, 'public')));

//webapp.use(express.static("public"));
webapp.use(express.json());

// Define a route for the home page
webapp.get('/', async (req: Request, res: Response) => {
  const options = {
      root: path.join(__dirname)
  };
  //res.sendFile(path.join(__dirname, 'public', 'index-single-agent.html'));
  res.sendFile('public/index-single-agent.html', options);

});

//Define a route for the ai agent application graph processing
webapp.post('/callagent', async (req: Request, res: Response) => {
  try {
    console.log('Received request on callagent endpoint.');
    const input_post_body=req.body;
    console.log('input_post_body:');
    console.log(input_post_body);

    const query = input_post_body.query;
    if (typeof query !== "string" || query.trim() === "") {
      res.status(400).json({ error: "A non-empty query is required." });
      return;
    }

    if (process.env.ENABLE_RAG_LLM.toLowerCase() === "true") {
      console.log("Setting IBM access token for optional hosted RAG.");
      await get_ibm_iam_token();
    }

    console.log("Input query for agent: ", query);

    const query_response = await runAppWithQuery(query);
    res.json(query_response);
  } catch (error) {
    console.error("Unable to complete agent request:", error);
    const message = error instanceof Error ? error.message : "Unknown agent error";
    res.status(500).json({ error: message });
  }
});

/////////////////////////////////


const makePostRequestCallByType = async (calltype: string, post_data: any): Promise<any> => {
  //async function makePostRequest(url: string, data: any): Promise<any> {
    try {
    
        const post_params = { 
            url: '', 
            headers: {},
            data: post_data
        };
        
        if ( calltype === 'get_token') {
            post_params.url = process.env.IBM_IAM_TOKEN_ENDPOINT;
            post_params.headers =  {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        } // end if ( calltype === 'get_token') {

        if ( calltype === 'get_risk_from_rag_llm' || calltype === 'get_interest_rate_from_rag_llm' ) {
          post_params.url = process.env.WATSONX_RISK_RAG_LLM_ENDPOINT;
          post_params.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + process.env.IBM_IAM_TOKEN
          }

        } // end if ( calltype === 'get_risk_from_rag_llm') {


        const response = await fetch(post_params.url, {
          method: 'POST',
          headers: post_params.headers,
          body: post_params.data, //JSON.stringify(data),
        });

        if (!response.ok) {
          console.log('makePostRequestCallByType ERROR:',response);
          throw new Error('Network response was not ok');
        }

        return response.json();



    } catch (error) {
      console.error('Error making POST request:', error);
      throw error;
    }
}

const get_ibm_iam_token = async () => {

  const data="grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=" + process.env.WATSONX_AI_APIKEY;

  var access_token="";

  if ( process.env.IBM_IAM_TOKEN_EXPIRATION === undefined || process.env.IBM_IAM_TOKEN_EXPIRATION === null || parseInt(process.env.IBM_IAM_TOKEN_EXPIRATION) < ( (Date.now()/1000)-300) ) {
    // Token has expired
    console.log("Token has expired process.env.IBM_IAM_TOKEN_EXPIRATION, Date.now()/1000 :",process.env.IBM_IAM_TOKEN_EXPIRATION,Date.now()/1000);
    console.log("Token has expired. Getting new token.");
    await makePostRequestCallByType('get_token',data)
    .then((responseData) => {
    //console.log('Response:', responseData);
    access_token=responseData.access_token;
    //access_token_expiration=responseData.expiration;
    process.env.IBM_IAM_TOKEN=responseData.access_token;
    process.env.IBM_IAM_TOKEN_EXPIRATION=responseData.expiration;    
    //return responseData.access_token;
    })
    .catch((error) => {
    console.error('Error:', error);
    });
  } else {
  // Token is still valid
    console.log("Token is valid. process.env.IBM_IAM_TOKEN_EXPIRATION, Date.now()/1000 :",process.env.IBM_IAM_TOKEN_EXPIRATION,Date.now()/1000);
    console.log("Existing token is valid.");
    access_token=process.env.IBM_IAM_TOKEN;
  }



  return access_token;

};


const setupTools = async () => {

    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    // Customer information
    // customer_id : "loren@ibm.com" || "loren" || "1111" 
    // credit_score = 455;
    // account_status = 'good-standing' ;

    // customer_id : "matt@ibm.com" || "matt" || "2222"
    // credit_score = 685;
    // account_status = 'closed';

    // customer_id : "hilda@ibm.com" || "hilda" || "3333"
    // credit_score = 825;
    // account_status = 'delinquent';

    const getCreditScore = tool(({ customer_id } ) => {
            var credit_score = 0;
	    customer_id=customer_id.toLowerCase();
            if (customer_id === "loren@ibm.com" || customer_id === "loren" || customer_id ==="1111" ) {
                    credit_score = 455;
            } else if (customer_id === "matt@ibm.com" || customer_id === "matt" || customer_id === "2222" )  {
                    credit_score = 685;
            } else if (customer_id === "hilda@ibm.com" || customer_id === "hilda" || customer_id === "3333" )  {
                    credit_score = 825;
            } else {
                    credit_score = getRndInteger(300, 850);
            }
            return credit_score; // 555;
        }, {
            name: 'get_credit_score',
            description: agentic_instructions.credit_score_tool,
            schema: z.object({
	       //customer_id: z.string().optional().describe("Customer's id"),
               customer_id: z.string().describe("Customer's id"),
            })
    })


    const getAccountStatus= tool(({ customer_id }) => {
            const status_list = ['delinquent', 'good-standing', 'closed' ];
            var account_status = 'good-standing';
            customer_id=customer_id.toLowerCase();
            if (customer_id === "loren@ibm.com" || customer_id === "loren" || customer_id ==="1111" ) {
                    account_status = 'good-standing' ;
            } else if (customer_id === "matt@ibm.com" || customer_id === "matt" || customer_id === "2222" )  {
                    account_status = 'closed';
            } else if (customer_id === "hilda@ibm.com" || customer_id === "hilda" || customer_id === "3333" )  {
                    account_status = 'delinquent';
            } else {
                    account_status = status_list[getRndInteger(0, 2)];
            }
            return account_status; // ;
        }, {
            name: 'get_account_status',
            description: agentic_instructions.account_status_tool,
            schema: z.object({
               //customer_id: z.string().optional().describe("Customer's id"),
               customer_id: z.string().describe("Customer's id"),
            })
    })


    const getOverallRisk= tool(({credit_score, account_status})  => {
            let overall_risk = '';
            //console.log('-----------------');
            //console.log('--->',credit_score, account_status);
            if (credit_score >= 750 && account_status == 'good-standing') {
                    overall_risk = 'low';
            } else if (credit_score >= 750 && account_status == 'closed')  {
                    overall_risk = 'medium';
            } else if (credit_score >= 750 && account_status == 'delinquent')  {
                    overall_risk = 'medium';
            } else if (credit_score < 750 && credit_score >=550 && account_status == 'good-standing')  {
                    overall_risk = 'medium';
            } else if (credit_score < 750 && credit_score >=550 && account_status == 'closed')  {
                    overall_risk = 'high';
            } else if (credit_score < 750 && credit_score >=550 && account_status == 'delinquent')  {
                    overall_risk = 'high';
            } else if (credit_score < 550)  {
                    overall_risk = 'high';
            } else {
                    overall_risk = 'unable to determine';
            }
            //console.log('--->,overall_risk');
            return overall_risk;
        }, {
            name: 'get_overall_risk',
            description: agentic_instructions.overall_risk_tool,
            schema: z.object({
                credit_score: z.number().describe("Credit score"),
                account_status: z.string().describe("Account status")
            })
    })


    const getInterestRate = tool(({ overall_risk } ) => {

            var interest_rate = 0;
            overall_risk=overall_risk.toLowerCase();
            if (overall_risk === "high") {
                interest_rate = 8;
            } else if (overall_risk === "medium") {
                interest_rate = 5;
            } else if (overall_risk === "low") {
                interest_rate = 3;
            } else {
                interest_rate = 12
            }
            return interest_rate;
        }, {
            name: 'get_interest_rate',
            description: agentic_instructions.interest_rate_tool,
            schema: z.object({
               //customer_id: z.string().optional().describe("Customer's id"),
               overall_risk: z.string().describe("Customer's overall risk"),
            })
    })

    const getOverallRiskFromRAGLLM= tool( async ({credit_score, account_status})  => {

      //Call the deployed RAG LLM API endpoint with above query/message content and the the overall risk description.
      const risk_rag_llm_query=agentic_instructions.overall_risk_from_rag_llm_tool_prompt.replace("{credit_score}", credit_score.toString()).replace("{account_status}", account_status);;

      //console.log("risk_rag_llm_query:", risk_rag_llm_query);
      //const payload = '{"messages": [{ "role": "user", "content": "' + risk_rag_llm_query + '" }]}';
      const risk_rag_llm_request_obj = {"messages": [{ "role": "user", "content": risk_rag_llm_query }]};
      const risk_rag_llm_request = JSON.stringify(risk_rag_llm_request_obj);
      console.log('payload:',risk_rag_llm_request);


      const risk_rag_llm_response = await makePostRequestCallByType('get_risk_from_rag_llm',risk_rag_llm_request)
      .then((responseData) => {
        console.log('Response:', responseData);
        return responseData;
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      console.log("risk_rag_llm_response:", risk_rag_llm_response);
      //console.log("choices[]:", risk_rag_llm_response.choices);
      console.log("risk_rag_llm_response.choices[0].message.content:", risk_rag_llm_response.choices[0].message.content);

      const overall_risk = risk_rag_llm_response.choices[0].message.content;

      //const overall_risk = "The risk is high";
      return overall_risk;

      }, {
          name: 'get_overall_risk_from_rag_llm',
          description: agentic_instructions.overall_risk_from_rag_llm_tool,
          schema: z.object({
              credit_score: z.number().describe("Credit score"),
              account_status: z.string().describe("Account status")
          })
    })

    const getInterestRateFromRAGLLM= tool( async ({overall_risk})  => {

      //Call the deployed RAG LLM API endpoint with above query/message content and the interest rate description.
      const interest_rate_rag_llm_query=agentic_instructions.interest_rate_from_rag_llm_tool_prompt.replace("{overall_risk}", overall_risk);

      //console.log("interest_rate_rag_llm_query:", interest_rate_rag_llm_query);
      //const payload = '{"messages": [{ "role": "user", "content": "' + interest_rate_rag_llm_query + '" }]}';
      const interest_rate_rag_llm_query_request_obj = {"messages": [{ "role": "user", "content": interest_rate_rag_llm_query }]};
      const interest_rate_rag_llm_query_request = JSON.stringify(interest_rate_rag_llm_query_request_obj);
      console.log('payload:',interest_rate_rag_llm_query_request);


      const interest_rate_rag_llm_response = await makePostRequestCallByType('get_interest_rate_from_rag_llm',interest_rate_rag_llm_query_request)
      .then((responseData) => {
        console.log('Response:', responseData);
        return responseData;
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      console.log("interest_rate_rag_llm_response:", interest_rate_rag_llm_response);
      //console.log("choices[]:", interest_rate_rag_llm_response.choices);
      console.log("interest_rate_rag_llm_response.choices[0].message.content:", interest_rate_rag_llm_response.choices[0].message.content);

      const interest_rate = interest_rate_rag_llm_response.choices[0].message.content;

      //const interest_rate = 55;
      return interest_rate;

      }, {
          name: 'get_interest_rate_from_rag_llm',
          description: agentic_instructions.interest_rate_from_rag_llm_tool,
          schema: z.object({
              overall_risk: z.string().describe("Overall risk")
          })
    })


  console.log("Checking process.env.ENABLE_RAG_LLM for RAG LLM use in tool.", process.env.ENABLE_RAG_LLM);
  if (process.env.ENABLE_RAG_LLM.toLowerCase()==='true') {
    console.log("Enabling use of RAG LLM in tool");
    const tools = [getCreditScore, getAccountStatus, getOverallRiskFromRAGLLM, getInterestRateFromRAGLLM ]
    return tools;
  } else {
    const tools = [getCreditScore, getAccountStatus, getOverallRisk, getInterestRate ]
    return tools;
  }

};

///

const setupModelWithTools = async (tools: Array<any>) => {
    console.log(`Using LiteLLM model ${process.env.LITELLM_MODEL} at ${process.env.LITELLM_BASE_URL}`);

    const model = new ChatOpenAI({
        model: process.env.LITELLM_MODEL,
        apiKey: process.env.LITELLM_API_KEY,
        temperature: agentic_instructions.model_temperature,
        maxTokens: agentic_instructions.model_maxTokens,
        maxRetries: 2,
        configuration: {
          baseURL: process.env.LITELLM_BASE_URL
        }
    });

    return {
      model,
      modelWithTools: model.bindTools(tools)
    };
};

///

const toolCallSignature = (toolCall) =>
  `${toolCall.name}:${JSON.stringify(toolCall.args)}`;

const setupApp = async (tools: Array<any>, model, modelWithTools) => {

    const toolNodeForGraph = new ToolNode(tools)
    
    const shouldContinue = (state) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    //console.log("lastMessage.tool_calls?.length::::",lastMessage.tool_calls?.length);
    if (!("tool_calls" in lastMessage) || !Array.isArray(lastMessage.tool_calls) || !lastMessage.tool_calls.length) {
        return END;
    }

    const previousToolCalls = new Set(
      messages
        .slice(0, -1)
        .flatMap((message) => Array.isArray(message.tool_calls) ? message.tool_calls : [])
        .map(toolCallSignature)
    );
    const repeatedCalls = lastMessage.tool_calls.every((toolCall) =>
      previousToolCalls.has(toolCallSignature(toolCall))
    );

    return repeatedCalls ? "finalize" : "tools";
    }


    const callModel = async (state) => {
        const { messages } = state;
        const response = await modelWithTools.invoke(messages);
        return { messages: response };
    }

    const finalizeRepeatedToolCall = async (state) => {
        const messagesWithoutRepeatedCall = state.messages.slice(0, -1);
        const response = await model.invoke([
          new SystemMessage(
            "Answer the user's question using the completed tool results in this conversation. Do not request or describe another tool call."
          ),
          ...messagesWithoutRepeatedCall
        ]);
        return { messages: response };
    }

    const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNodeForGraph)
    .addNode("finalize", finalizeRepeatedToolCall)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", "finalize", END])
    .addEdge("tools", "agent")
    .addEdge("finalize", END);

    const app = workflow.compile()

    return app;


};


////////////////////////////////

const tools = await setupTools();

const { model, modelWithTools } = await setupModelWithTools(tools);

const app = await setupApp(tools,model,modelWithTools);

/////////////////////////////////

const runAppWithQuery = async (query: string) => {

    console.log("\n=====START======");

    const stream = await app.stream(
    {
       //messages: [{ role: "user", content: query }],
       messages: [
         new SystemMessage(agentSystemPrompt),
         new HumanMessage({content: query })
       ]
    },
    {
        streamMode: "values",
        recursionLimit: 12
    }
    )

    const chat_messages=[];

    for await (const chunk of stream) {
        const lastMessage = chunk.messages[chunk.messages.length - 1];
        const type = lastMessage._getType();
        const content = lastMessage.content;
        const toolCalls = lastMessage.tool_calls;
        console.dir({
            type,
            content,
            toolCalls
        }, { depth: null });
        chat_messages.push({
            type,
            content,
            toolCalls
        });
    }

    //const result = "Result from the agent is the in final message.";
    //console.log("Agent result: ", result);
    console.log("\n=====END======");

    return chat_messages;
}

////////////////////////////

webapp.listen(Number(process.env.APPLICATION_PORT), process.env.APPLICATION_HOST, () => {
  console.log(`Agentic AI application ${process.env.APPLICATION_NAME} is starting...`);
  console.log(`Server is running on http://${process.env.APPLICATION_HOST}:${process.env.APPLICATION_PORT}`);
});








