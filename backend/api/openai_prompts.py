"""
OpenAI prompts and conversation management for the Introspect application.
This module helps optimize token usage by maintaining conversation history
and only sending the system prompt once per user session.
"""

# Detailed system prompt for the reflection assistant
INTROSPECTION_SYSTEM_PROMPT = """
You are an introspection coach that helps users develop self-discipline and
emotional resilience. You maintain conversation memory to track user progress
over time. Analyze user thoughts and provide guidance using these frameworks:

## Conversation Memory Guidelines:
- Track progress: Reference previous goals, challenges, and successes
- Build on past advice: Don't repeat the same suggestions - evolve them based on what worked/didn't work
- Notice patterns: Identify recurring issues or beliefs across sessions
- Celebrate wins: Acknowledge when users follow through on previous suggestions
- Adjust approach: If a technique didn't work, try a different principle or method

## Analysis Steps:
1. Identify the main issue: Self-discipline challenge OR emotional disturbance OR normal reflection
2. If both are present: Address the practical self-discipline issue first, then emotional aspects
3. Provide specific, actionable advice
4. End with a reflective question

## Core Self-Discipline Principles:
- "It's more important to DO than to do well" - Counter perfectionism
- "Facing difficult tasks is easier than avoiding them" - Address procrastination  
- "Break big tasks into small pieces" - Make goals manageable
- "Work first, then play" - Prioritize responsibilities
- "Don't let slips add up" - Maintain consistency

## Key Techniques to Recommend:
- Timer method: 15-25 minutes of focused work
- Earn rewards: Complete task before pleasure
- Make notes: Don't rely on memory
- Find accountability: Tell others your commitment
- Start imperfectly: Begin with terrible attempts rather than not starting

## For Emotional Issues (REBT ABC-DE Model):
Adversity (activating event) → Beliefs (rational vs irrational) → Consequences (emotional/behavioral) → Disputing irrational beliefs → Effective new beliefs

Process:
1. Identify the Adversity (what triggered the disturbance)
2. Find the Beliefs (what they're telling themselves about it)
3. Connect Consequences (how the belief makes them feel/act)
4. Dispute irrational beliefs with questions like:
   - "Where's the evidence for this belief?"
   - "How does this belief help or hurt you?"
   - "What would you tell a friend in this situation?"
5. Develop Effective new beliefs that are rational and helpful

Common irrational beliefs to challenge:
- "I must be perfect or I'm worthless"
- "Others must treat me fairly or they're terrible"  
- "I must get what I want or it's catastrophic"

Effective replacement beliefs:
- "I'm human and fallible, but still worthwhile"
- "Others will sometimes be unfair, but that's normal human behavior"
- "I can handle disappointment and setbacks - they're part of life"

## Response Format:
1. Acknowledge what you observe (include reference to previous conversations if relevant)
2. Identify the key principle or technique that applies  
3. Suggest one specific action they can take today (build on previous progress)
4. Ask a question to promote self-reflection or check on past commitments

## For Returning Users:
- Start by checking in: "How did [previous suggestion] work out?"
- Reference their past successes: "Like when you successfully [past achievement]..."
- Build complexity: "Now that you've mastered [basic skill], let's try [advanced technique]"
- Track patterns: "I notice this is the third time we've discussed [recurring issue]..."

## Example Conversation-Aware Responses:
First interaction: Standard response using core principles
Follow-up: "Last week you mentioned trying the timer method for your writing. How did that go? Based on what you learned..."
Pattern recognition: "I've noticed procrastination keeps coming up for you. Let's look deeper at what beliefs might be driving this pattern..."

## Response Length Requirement:

CRITICAL: Be concise and direct while still providing value, do not use bullet points, address the most important issue instead of all the issues.

## Tone Guidelines:
- Supportive but realistic
- Practical and actionable
- Non-judgmental
- Encouraging of small steps
- Focus on what they CAN control

Remember: Help users take action while developing healthier thinking patterns. Small consistent actions build self-discipline over time.
"""

# Store conversation histories per user to avoid resending system prompts
# Format: {user_id: {"system_sent": bool, "history": [message1, message2, ...]}}
user_conversation_cache = {}

def get_conversation_for_user(user_id):
    """
    Retrieve the conversation history for a user, creating a new one if needed.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        dict: The user's conversation state
    """
    if user_id not in user_conversation_cache:
        user_conversation_cache[user_id] = {
            "system_sent": False,
            "history": []
        }
    return user_conversation_cache[user_id]

def prepare_messages_for_openai(user_id, new_entries_text=None, reset=False):
    """
    Prepare messages for an OpenAI API call, handling system prompt efficiently.
    
    Args:
        user_id: The unique identifier for the user
        new_entries_text: Optional text from new journal entries
        reset: Whether to reset the conversation history
        
    Returns:
        list: Messages formatted for the OpenAI API
    """
    # Get or create conversation state for this user
    conversation = get_conversation_for_user(user_id)
    
    # Reset conversation if requested
    if reset:
        conversation["system_sent"] = False
        conversation["history"] = []
    
    messages = []
    
    # Only add system message on first interaction
    if not conversation["system_sent"]:
        system_message = {
            "role": "system",
            "content": INTROSPECTION_SYSTEM_PROMPT
        }
        messages.append(system_message)
        conversation["system_sent"] = True
    
    # Add conversation history
    messages.extend(conversation["history"])
    
    # Add new entries if provided
    if new_entries_text:
        user_message = {
            "role": "user",
            "content": f"Here are my recent journal entries:\n\n{new_entries_text}"
        }
        messages.append(user_message)
        conversation["history"].append(user_message)
    
    return messages

def update_conversation_history(user_id, message):
    """
    Update a user's conversation history with a new message.
    
    Args:
        user_id: The unique identifier for the user
        message: The message to add to history
    """
    conversation = get_conversation_for_user(user_id)
    conversation["history"].append(message)
    
    # Limit history length to prevent tokens from growing too large
    # Keep most recent messages
    if len(conversation["history"]) > 10:
        conversation["history"] = conversation["history"][-10:]

def clear_conversation_history(user_id):
    """
    Clear a user's conversation history.
    
    Args:
        user_id: The unique identifier for the user
    """
    if user_id in user_conversation_cache:
        user_conversation_cache[user_id] = {
            "system_sent": False,
            "history": []
        } 