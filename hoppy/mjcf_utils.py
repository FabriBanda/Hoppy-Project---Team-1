from __future__ import annotations

from pathlib import Path
import xml.etree.ElementTree as ET


def project_root() -> Path:
    return Path(__file__).resolve().parents[1]


def default_xml_path() -> Path:
    return project_root() / "models" / "hoppy.xml"


def xml_with_overrides(source_xml: Path, *, no_armature: bool = False, no_damping: bool = False,
                       no_knee_spring: bool = False, output_name: str = "_tmp_hoppy.xml") -> Path:
    """Create a temporary MJCF file with selected mechanical effects disabled."""
    tree = ET.parse(source_xml)
    root = tree.getroot()

    for joint in root.iter("joint"):
        name = joint.attrib.get("name", "")
        if name in {"joint3", "joint4"}:
            if no_armature:
                joint.set("armature", "0")
            if no_damping:
                joint.set("damping", "0")
        if name == "joint4" and no_knee_spring:
            joint.set("stiffness", "0")

    out = source_xml.parent / output_name
    tree.write(out, encoding="utf-8", xml_declaration=True)
    return out
