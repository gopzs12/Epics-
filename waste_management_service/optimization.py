import functools

@functools.lru_cache(maxsize=128)
def optimize_layout(fabric_length: float, fabric_width: float, pattern_length: float, pattern_width: float):
    """
    Calculates the best possible cutting layout for a single rectangular pattern over a large fabric.
    It checks both Standard and Rotated (90-deg) placements to pack the maximum items.
    """
    if pattern_length <= 0 or pattern_width <= 0:
        return None
        
    # Standard orientation
    rows_std = int(fabric_length // pattern_length)
    cols_std = int(fabric_width // pattern_width)
    max_items_std = rows_std * cols_std
    
    # Rotated orientation (90 degrees)
    rows_rot = int(fabric_length // pattern_width)
    cols_rot = int(fabric_width // pattern_length)
    max_items_rot = rows_rot * cols_rot
    
    # Pick the best configuration
    if max_items_rot > max_items_std:
        best_orientation = "Rotated (90°)"
        max_items = max_items_rot
        best_rows = rows_rot
        best_cols = cols_rot
        used_p_len = pattern_width
        used_p_wid = pattern_length
    else:
        best_orientation = "Standard (0°)"
        max_items = max_items_std
        best_rows = rows_std
        best_cols = cols_std
        used_p_len = pattern_length
        used_p_wid = pattern_width
        
    return {
        "best_orientation": best_orientation,
        "max_items": max_items,
        "layout_rows": best_rows,
        "layout_cols": best_cols,
        "used_length": round(best_rows * used_p_len, 4),
        "used_width": round(best_cols * used_p_wid, 4),
        "pattern_display": {
            "length": used_p_len,
            "width": used_p_wid
        }
    }
