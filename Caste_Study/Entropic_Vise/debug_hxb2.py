from entropy_calculator import load_fasta

def inspect_hxb2_context(filepath, center_idx=1230, window=50):
    sequences = load_fasta(filepath)
    hxb2 = sequences[0]
    
    start = max(0, center_idx - window)
    end = min(len(hxb2), center_idx + window)
    
    fragment = hxb2[start:end]
    print(f"HXB2 Context around {center_idx} ({start}-{end}):")
    print(fragment)
    print("-" * len(fragment))
    
    # Mark the center
    pointer = " " * (center_idx - start) + "^"
    print(pointer)
    
    # Check what IS there in other sequences?
    # Let's check the consensus of the first 10 seqs
    print("\nCheck other sequences at this index:")
    for i in range(1, 10):
        seq = sequences[i]
        frag = seq[start:end]
        print(f"Seq{i}: {frag}")

def main():
    filepath = "/Users/lesz/Documents/academic-integrity-agent/Caste_Study/Entropic_Vise/HIV_Sequence_DB/HIV1_FLT_2022_env_PRO.fasta"
    inspect_hxb2_context(filepath, 1230)

if __name__ == "__main__":
    main()
