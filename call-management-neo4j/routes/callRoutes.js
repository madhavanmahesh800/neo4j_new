const express = require('express');
const router = express.Router();
const { session } = require('../config/db');

// Create a new call record
router.post('/', async (req, res) => {
    const { agentName, customerName, phoneNumber, issue, status, callDuration } = req.body;

    try {
        await session.run(
            `MERGE (c:Customer {name: $customerName, phone: $phoneNumber})
             CREATE (call:Call {agentName: $agentName, issue: $issue, status: $status, callDuration: $callDuration, createdAt: datetime()})
             MERGE (c)-[:MADE_CALL]->(call)`,
            { agentName, customerName, phoneNumber, issue, status, callDuration }
        );
        
        res.status(201).json({ message: "Call record created successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all call records
router.get('/', async (req, res) => {
    try {
        console.log("Fetching call records from Neo4j...");

        const result = await session.run(
            `MATCH (c:Customer)-[:MADE_CALL]->(call:Call)
             RETURN ID(call) AS id, 
                    c.name AS customerName, 
                    call.agentName AS agentName, 
                    call.issue AS issue, 
                    call.status AS status, 
                    call.callDuration AS callDuration, 
                    call.createdAt AS createdAt`
        );

        console.log("Raw result from Neo4j:", result.records);

        const calls = result.records.map(record => ({
            id: record.get('id').low,  // Ensure ID is converted properly
            customerName: record.get('customerName'),
            agentName: record.get('agentName'),  
            issue: record.get('issue'),
            status: record.get('status'),
            callDuration: record.get('callDuration'),
            createdAt: record.get('createdAt')
        }));

        console.log("Processed call records:", calls);
        res.json(calls);
    } catch (error) {
        console.error("Error fetching calls:", error);
        res.status(500).json({ error: error.message });
    }
});


// Update call status
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await session.run(
            `MATCH (call:Call)
             WHERE ID(call) = $id
             SET call.status = $status`,
            { id: parseInt(id), status }
        );

        res.json({ message: "Call status updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a call record
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await session.run(
            `MATCH (call:Call)
             WHERE ID(call) = $id
             DETACH DELETE call`,
            { id: parseInt(id) }
        );

        res.json({ message: "Call record deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
