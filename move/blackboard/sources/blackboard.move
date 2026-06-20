/// The mutable cell the agentic state layer's blackboard needs.
///
/// Walrus blobs are immutable + content-addressed, so "which blobId is current
/// canon" / "the log head" cannot live on Walrus. They live here, in a shared
/// on-chain object, so ownership + tamper-evidence extend to the pointer too.
///
/// `set` enforces compare-and-swap so concurrent agents (e.g. two Gamemasters
/// and Continuity) can coordinate through this object without clobbering.
module blackboard::blackboard;

use std::string::{Self, String};
use sui::table::{Self, Table};

const E_CAS: u64 = 1;

public struct Blackboard has key {
    id: UID,
    pointers: Table<String, String>,
}

fun init(ctx: &mut TxContext) {
    let bb = Blackboard { id: object::new(ctx), pointers: table::new(ctx) };
    transfer::share_object(bb);
}

/// Compare-and-swap set.
/// - `has_expected = false`: unconditional write.
/// - `has_expected = true`: requires current value == `expected`; for an absent
///   key, `expected` must be the empty string (matches the "null" convention).
public fun set(
    bb: &mut Blackboard,
    key: String,
    value: String,
    has_expected: bool,
    expected: String,
) {
    if (table::contains(&bb.pointers, key)) {
        if (has_expected) {
            assert!(*table::borrow(&bb.pointers, key) == expected, E_CAS);
        };
        let _old = table::remove(&mut bb.pointers, key);
        table::add(&mut bb.pointers, key, value);
    } else {
        if (has_expected) {
            assert!(string::length(&expected) == 0, E_CAS);
        };
        table::add(&mut bb.pointers, key, value);
    };
}

/// Read a pointer (used via devInspect — no gas). None if absent.
public fun get(bb: &Blackboard, key: String): Option<String> {
    if (table::contains(&bb.pointers, key)) {
        option::some(*table::borrow(&bb.pointers, key))
    } else {
        option::none()
    }
}
