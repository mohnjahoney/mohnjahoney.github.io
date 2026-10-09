# particles move from A to B
# t - time : 0-1
# n - group number : 0-19
# m - member number : 0-9

# The canonical surface is a surface of revolution around z. We translate it
# along x and rotate it around x before projecting onto the webpage's x-y view.

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
import argparse

ptA = [0, 0, 0]
ptB = [1, 0, 0]
ts = np.linspace(0, 1, 200)

N_GROUPS = 12
N_MEMBERS = 8


# studio-mark-4.svg, converted from SVG coordinates into a compact list of
# cubic-Bezier segments. The SVG's y axis points downward, so we flip y when
# normalizing it below. The final path runs from (0, 0) to (1, 0).
STUDIO_MARK_4 = np.array([
    [[92.21, 294.48], [114.53, 294.48], [307.09, 289.52], [461.21, 250.65]],
    [[461.21, 250.65], [497.16, 241.59], [656.67, 201.92], [630.64, 115.16]],
    [[630.64, 115.16], [607.08, 36.63], [464.93, 30.85], [391.53, 88.80]],
    [[391.53, 88.80], [339.32, 130.02], [318.66, 206.05], [336.69, 281.28]],
    [[336.69, 281.28], [366.59, 406.05], [505.43, 539.10], [616.36, 531.89]],
    [[616.36, 531.89], [708.73, 525.88], [867.72, 417.02], [811.64, 290.17]],
    [[811.64, 290.17], [771.54, 199.44], [670.72, 211.01], [614.72, 242.62]],
    [[614.72, 242.62], [568.24, 268.86], [521.13, 326.71], [567.40, 380.24]],
    [[567.40, 380.24], [605.43, 424.23], [678.15, 432.49], [713.55, 378.69]],
    [[713.55, 378.69], [760.80, 306.88], [693.86, 196.96], [735.89, 170.60]],
    [[735.89, 170.60], [791.37, 135.80], [959.14, 295.31], [959.14, 295.31]],
], dtype=float)


STUDIO_MARK_6 = np.array([
    [[107.91, 295.31], [139.32, 295.31], [345.10, 296.13], [387.90, 280.57]],
    [[387.90, 280.57], [417.83, 269.69], [470.77, 276.24], [522.47, 222.36]],
    [[522.47, 222.36], [588.14, 153.92], [567.15, 76.17], [629.76, 106.25]],
    [[629.76, 106.25], [735.55, 157.07], [806.21, 384.18], [604.09, 510.31]],
    [[604.09, 510.31], [583.45, 523.19], [492.34, 577.22], [429.81, 530.52]],
    [[429.81, 530.52], [361.78, 479.71], [384.66, 352.33], [513.59, 352.33]],
    [[513.59, 352.33], [596.56, 352.33], [639.40, 405.07], [609.29, 456.82]],
    [[609.29, 456.82], [586.49, 496.01], [501.36, 569.83], [462.70, 479.24]],
    [[462.70, 479.24], [443.48, 434.22], [455.67, 395.27], [496.23, 403.07]],
    [[496.23, 403.07], [541.60, 411.80], [596.49, 474.01], [529.18, 471.47]],
    [[529.18, 471.47], [505.71, 470.58], [500.47, 463.07], [510.05, 430.66]],
    [[510.05, 430.66], [521.96, 390.35], [532.34, 320.61], [607.61, 268.69]],
    [[607.61, 268.69], [724.32, 188.20], [765.65, 310.15], [838.34, 328.33]],
    [[838.34, 328.33], [858.29, 333.31], [900.05, 335.35], [944.26, 330.02]],
], dtype=float)


STUDIO_MARK_7 = np.array([
    [[131.06, 298.61], [172.38, 300.26], [231.88, 306.88], [277.77, 365.58]],
    [[277.77, 365.58], [344.27, 450.67], [268.24, 499.43], [331.12, 532.44]],
    [[331.12, 532.44], [400.47, 568.85], [517.83, 522.57], [535.19, 473.54]],
    [[535.19, 473.54], [545.92, 443.24], [538.97, 353.98], [474.20, 353.98]],
    [[474.20, 353.98], [429.26, 353.98], [417.83, 396.96], [418.94, 417.01]],
    [[418.94, 417.01], [420.86, 451.52], [465.76, 523.40], [514.72, 458.80]],
    [[514.72, 458.80], [584.77, 366.38], [526.09, 175.47], [581.33, 112.05]],
    [[581.33, 112.05], [615.34, 73.00], [740.96, 26.71], [746.65, 160.35]],
    [[746.65, 160.35], [747.57, 182.08], [750.88, 339.11], [674.69, 292.08]],
    [[674.69, 292.08], [617.00, 256.46], [624.44, 172.17], [670.30, 165.34]],
    [[670.30, 165.34], [702.12, 160.60], [815.34, 115.97], [838.78, 151.90]],
    [[838.78, 151.90], [864.93, 192.00], [753.23, 292.52], [832.31, 393.70]],
    [[832.31, 393.70], [883.94, 459.77], [833.52, 292.00], [902.81, 324.60]],
    [[902.81, 324.60], [940.23, 342.21], [955.89, 326.90], [968.23, 320.92]],
], dtype=float)


def _normalize_bezier_path(raw_points):
    """Rotate, scale, translate, and flip an SVG path into A=(0,0), B=(1,0)."""
    points = np.asarray(raw_points, dtype=float).copy()
    start = points[0, 0]
    end = points[-1, 3]
    delta = end - start
    length = np.linalg.norm(delta)
    if length == 0:
        raise ValueError("Bezier path endpoints must be distinct")

    # Complex multiplication by exp(-i*angle) rotates the endpoint vector
    # onto +x, then division by its length maps the endpoint to x=1.
    z = points[..., 0] + 1j * points[..., 1]
    z = (z - (start[0] + 1j * start[1])) / (delta[0] + 1j * delta[1])
    points[..., 0] = z.real
    points[..., 1] = -z.imag
    return points


def _bezier_segment(control_points, u):
    """Evaluate one cubic Bezier segment for an array of parameters."""
    p0, p1, p2, p3 = control_points
    u = np.asarray(u)[..., None]
    v = 1 - u
    return v**3 * p0 + 3 * v**2 * u * p1 + 3 * v * u**2 * p2 + u**3 * p3


def _arc_table(raw_points, samples_per_segment=700):
    """Build a dense lookup table for constant-speed traversal."""
    segments = _normalize_bezier_path(raw_points)
    points = np.concatenate([
        _bezier_segment(segment, np.linspace(0, 1, samples_per_segment, endpoint=False))
        for segment in segments
    ] + [segments[-1, -1][None, :]])
    distances = np.linalg.norm(np.diff(points, axis=0), axis=1)
    distance = np.concatenate([[0.0], np.cumsum(distances)])
    return points, distance / distance[-1]


_STUDIO_MARKS = {
    4: _arc_table(STUDIO_MARK_4),
    6: _arc_table(STUDIO_MARK_6),
    7: _arc_table(STUDIO_MARK_7),
}


def studio_mark_position(mark, t):
    """Position on a normalized studio mark at constant visual speed."""
    points, arc = _STUDIO_MARKS[int(mark)]
    t = float(np.clip(t, 0, 1))
    x = np.interp(t, arc, points[:, 0])
    y = np.interp(t, arc, points[:, 1])
    return np.array([x, y])


def studio_mark_4_position(t):
    """Backward-compatible wrapper for studio-mark-4."""
    return studio_mark_position(4, t)


def interesting_shape(x):
    """The radial profile used by each group's particles."""
    x = np.asarray(x)
    envelope = np.sin(np.pi * x) ** 0.72
    bumps = (
        0.88 * np.exp(-((x - 0.20) / 0.16) ** 2)
        + 0.43 * np.exp(-((x - 0.49) / 0.095) ** 2)
        + 0.62 * np.exp(-((x - 0.72) / 0.105) ** 2)
    )
    return envelope * bumps

def particle_position_2D(n, m, t, n_groups=N_GROUPS, n_members=N_MEMBERS):
    """Position of one particle in the moving plane's local coordinates."""
    group_phase = 2 * np.pi * n / n_groups
    member_phase = 2 * np.pi * m / n_members

    radius = 0.6 * interesting_shape(t)
    radius *= 2 + 0.2 * m * t

    turns = 4.0 + 1 * t * np.sin(member_phase)
    theta = group_phase + 0.5 * t * member_phase + 2 * np.pi * turns * t

    # These are the circular x-y coordinates of the particle on the
    # cross-section of the surface of revolution.
    return np.array([radius * np.cos(theta), radius * np.sin(theta)])


def temporary_lag(a, t):
    """A tanh-shaped bump that is zero, with zero slope, at both endpoints."""
    return a * np.tanh(3 * np.sin(np.pi * t)) ** 4


def plane_origin_position_3D(m, t):
    """Position of the moving plane's origin in world coordinates."""
    start = np.asarray(ptA, dtype=float)
    end = np.asarray(ptB, dtype=float)
    return (1 - t) * start + t * end


def rotation_x(angle):
    c, s = np.cos(angle), np.sin(angle)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])

def rotation_y(angle):
    c, s = np.cos(angle), np.sin(angle)
    return np.array([[c, 0, -s], [0, 1, 0], [s, 0, c]])

def particle_position_object_3D(
    n, m, t, n_groups=N_GROUPS, n_members=N_MEMBERS
):
    """Return a particle's position on the canonical surface of revolution."""
    local_x, local_y = particle_position_2D(n, m, t, n_groups, n_members)

    # The 2D path supplies the circular x-y cross-section. z is the coordinate
    # along the surface's axis of revolution.
    return np.array([
        local_x,
        local_y,
        t,
    ])


def plane_orientation_rotation(m, t):
    """Rotate the surface around y, returning to neutral at both endpoints."""
    # angle = 0.9 * np.sin(np.pi * t) ** 2
    angle = np.pi * t
    return rotation_y(angle)


def particle_position_3D(
    n, m, t, n_groups=N_GROUPS, n_members=N_MEMBERS
):
    """Return the translated and x-rotated world position of one particle."""
    origin = plane_origin_position_3D(m, t)
    object_position = particle_position_object_3D(
        n, m, t, n_groups, n_members
    )
    return origin + plane_orientation_rotation(m, t) @ object_position


def project_to_screen(position, t):
    """Project 3D object coordinates to webpage-style 2D screen coordinates.

    The x-y projection is the webpage view. The z coordinate is depth and is
    discarded.
    """
    return np.asarray(position)[:2]


def smoothstep(u):
    """Smoothly map 0..1 to 0..1 with zero slopes at both ends."""
    u = np.clip(u, 0, 1)
    return u * u * (3 - 2 * u)


def ribbon_particle_position(n, m, t, n_groups=1, n_members=12):
    """Screen-space position for a controlled, swirling ribbon particle."""
    group_phase = 2 * np.pi * n / max(n_groups, 1)
    member_phase = 2 * np.pi * m / n_members
    s = np.clip(t, 0, 1)
    one_minus_s = 1 - s

    # Bounded per-group variation: related paths, but not carbon copies.
    group_variation = np.sin(1.7 * group_phase + 0.4)
    burst_width = 0.37 * (1 + 0.12 * group_variation)
    burst_time = 0.15 + 0.025 * np.cos(group_phase)
    collapse_start = 0.59 + 0.06 * np.sin(group_phase + 0.7)
    swirl_turns = 2.2 + 0.28 * np.cos(1.3 * group_phase)
    swoop_direction = 1 if np.cos(group_phase) >= 0 else -1
    swoop_amount = 1 + 0.14 * np.sin(group_phase + 1.1)

    # A broad cubic-Bezier swoop from A to B.
    x = 3 * one_minus_s**2 * s * 0.08 + 3 * one_minus_s * s**2 * 0.62 + s**3
    y = (
        3 * one_minus_s**2 * s * swoop_direction * 0.27 * swoop_amount
        + 3 * one_minus_s * s**2 * swoop_direction * 0.43 * swoop_amount
    )

    # Fast controlled exit, then a gentle convergence at B.
    grow = smoothstep(s / burst_time)
    shrink = 1 - smoothstep((s - collapse_start) / (1 - collapse_start))
    radius = burst_width * grow * shrink

    # A little over one full turn: visible swirl without visual chaos.
    angle = member_phase + group_phase + swirl_turns * np.pi * s
    return np.array([x + radius * np.cos(angle), y + radius * np.sin(angle)])


def create_animation(N, M, T, save_path=None, show=True):
    """Animate a fast, swooping ribbon of N groups with M members.

    Args:
        N: Number of particle groups.
        M: Number of members in each group.
        T: Animation duration in seconds.
        save_path: Optional .gif or .mp4 output path.
        show: Whether to open the Matplotlib window.

    Returns:
        The Matplotlib animation object.
    """
    N = int(N)
    M = int(M)
    T = float(T)
    if N < 1 or M < 1 or T <= 0:
        raise ValueError("N and M must be positive, and T must be greater than 0")

    frames = 50
    times = np.linspace(0, 1, frames)
    positions = np.empty((N, M, frames, 2))
    for n in range(N):
        for m in range(M):
            positions[n, m] = np.array(
                [ribbon_particle_position(n, m, t, N, M) for t in times]
            )

    fig = plt.figure(figsize=(11, 8), facecolor="#0d1117")
    ax = fig.add_subplot(111, facecolor="#0d1117")
    ax.set_xlim(-0.38, 1.08)
    ax.set_ylim(-0.42, 0.78)
    ax.set_aspect("equal")
    ax.set_xlabel("screen x", color="#d7dee8")
    ax.set_ylabel("screen y", color="#d7dee8")
    ax.tick_params(colors="#9da9b8")
    ax.grid(False)

    group_colors = plt.cm.turbo(np.linspace(0.08, 0.92, N))
    particle_colors = np.repeat(group_colors, M, axis=0)
    lines = []
    for n in range(N):
        for _ in range(M):
            line = ax.plot([], [], color=group_colors[n], alpha=0.42, linewidth=1.0)[0]
            lines.append(line)

    initial = positions[:, :, 0, :].reshape(N * M, 2)
    points = ax.scatter(
        initial[:, 0], initial[:, 1], c=particle_colors, s=26,
    )
    ax.scatter([0, 1], [0, 0], color="#f7f2d0", s=35)
    ax.text(0, 0.04, "A", color="#f7f2d0", ha="center")
    ax.text(1, 0.04, "B", color="#f7f2d0", ha="center")

    def update(frame):
        visible = max(2, frame + 1)
        line_index = 0
        for n in range(N):
            for m in range(M):
                path = positions[n, m, :visible]
                lines[line_index].set_data(path[:, 0], path[:, 1])
                line_index += 1

        current = positions[:, :, frame, :].reshape(N * M, 2)
        points.set_offsets(current)
        ax.set_title(
            f"{N} groups × {M} members · swirling ribbon · {frame / (frames - 1) * T:.1f}s",
            color="#f7f2d0",
            pad=18,
        )
        return [*lines, points]

    animation = FuncAnimation(
        fig,
        update,
        frames=frames,
        interval=1000 * T / frames,
        blit=False,
    )

    if save_path:
        if str(save_path).lower().endswith(".gif"):
            animation.save(save_path, writer=PillowWriter(fps=frames / T), dpi=120)
        else:
            animation.save(save_path, fps=frames / T, dpi=120)

    if show:
        plt.show()

    return animation


def create_single_particle_animation(T=1.0, save_path=None, show=True):
    """Launch one particle along each of studio-marks 4, 6, and 7."""
    T = float(T)
    if T <= 0:
        raise ValueError("T must be greater than 0")

    # Use roughly 240 displayed positions for a one-second animation. The
    # curve lookup itself is denser; this controls visible frame-to-frame
    # segmentation in the animation window.
    frames = max(2, round(240 * T))
    times = np.linspace(0, 1, frames)
    marks = (4, 6, 7)
    positions = np.array([
        [studio_mark_position(mark, t) for t in times]
        for mark in marks
    ])

    fig, ax = plt.subplots(figsize=(11, 7), facecolor="#0d1117")
    ax.set_facecolor("#0d1117")
    ax.set_aspect("equal")
    ax.set_xlim(-0.08, 1.08)
    y_extent = max(0.72, float(np.max(np.abs(positions[:, :, 1]))) + 0.12)
    ax.set_ylim(-y_extent, y_extent)
    ax.axis("off")

    colors = ("#f2b84b", "#68b7ff", "#d98cff")
    for path, color in zip(positions, colors):
        ax.plot(path[:, 0], path[:, 1], color=color, linewidth=1.0, alpha=0.24)
    ax.scatter([0, 1], [0, 0], color="#f7f2d0", s=34, zorder=3)
    ax.text(0, 0.055, "A", color="#f7f2d0", ha="center")
    ax.text(1, 0.055, "B", color="#f7f2d0", ha="center")

    trails = [
        ax.plot([], [], color=color, linewidth=2.2, alpha=0.76)[0]
        for color in colors
    ]
    particles = [
        ax.plot([], [], "o", color=color, markersize=7, zorder=4)[0]
        for color in colors
    ]

    def update(frame):
        for path, trail, particle in zip(positions, trails, particles):
            visible = path[:frame + 1]
            trail.set_data(visible[:, 0], visible[:, 1])
            particle.set_data([path[frame, 0]], [path[frame, 1]])
        ax.set_title(
            f"studio-marks 4 · 6 · 7 · {frame / (frames - 1) * T:.2f}s",
            color="#f7f2d0",
            pad=16,
        )
        return [*trails, *particles]

    animation = FuncAnimation(
        fig,
        update,
        frames=frames,
        interval=1000 * T / frames,
        blit=False,
    )

    if save_path:
        if str(save_path).lower().endswith(".gif"):
            animation.save(save_path, writer=PillowWriter(fps=frames / T), dpi=120)
        else:
            animation.save(save_path, fps=frames / T, dpi=120)

    if show:
        plt.show()

    return animation


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Animate the hand-drawn trajectory.")
    parser.add_argument("--duration", "-T", type=float, default=1.0)
    parser.add_argument("--save", type=str, default=None)
    args = parser.parse_args()
    create_single_particle_animation(args.duration, args.save)
