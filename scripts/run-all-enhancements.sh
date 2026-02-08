#!/bin/bash
# Batch enhancement runner - processes all remaining job roles
# Runs batches 1-144 to complete all 7,205 pages

cd /Users/rahuldubey/resumemaker/resume-maker

echo "=================================="
echo "BULK ENHANCEMENT - ALL BATCHES"
echo "=================================="
echo ""
echo "Processing batches 1-144 (7,155 remaining docs)"
echo "Batch size: 50 docs per batch"
echo ""

# Total batches to process
total_batches=144
processed=0

# Process in chunks of 20 batches at a time for monitoring
chunk_size=20

for ((chunk_start=1; chunk_start<=total_batches; chunk_start+=chunk_size)); do
    chunk_end=$((chunk_start + chunk_size - 1))
    if [ $chunk_end -gt $total_batches ]; then
        chunk_end=$total_batches
    fi
    
    echo "📦 Processing batches $chunk_start to $chunk_end..."
    
    for ((batch=chunk_start; batch<=chunk_end; batch++)); do
        echo "  Batch $batch/$total_batches..."
        node scripts/enhance-job-roles.js $batch 1
        
        if [ $? -ne 0 ]; then
            echo "❌ Error in batch $batch. Stopping."
            exit 1
        fi
        
        processed=$((processed + 1))
        echo "  ✅ Progress: $processed/$total_batches batches complete ($((processed * 50)) docs)"
        
        # Short pause between batches
        sleep 2
    done
    
    echo "✅ Chunk complete ($chunk_start-$chunk_end)"
    echo "Pausing 10 seconds before next chunk..."
    echo ""
    sleep 10
done

echo ""
echo "=================================="
echo "✅ ALL BATCHES COMPLETE"
echo "=================================="
echo "Total documents enhanced: $((processed * 50))"
echo ""
echo "Run audit to verify:"
echo "  node scripts/audit-job-roles.js"
