//
//  PileLogoView.swift
//  PileiOS
//
//  Created by LewiNimu on 16/09/2025.
//

import SwiftUI

struct PileLogoView: View {
    let size: CGFloat
    let color: Color

    init(size: CGFloat = 40, color: Color = .primary) {
        self.size = size
        self.color = color
    }

    var body: some View {
        ZStack {
            // Background shapes (white/light colored)
            Group {
                // Bottom left stack
                Path { path in
                    path.move(to: CGPoint(x: 0, y: 67.5781))
                    path.addLine(to: CGPoint(x: 21.6456, y: 80.0744))
                    path.addLine(to: CGPoint(x: 21.6456, y: 105.069))
                    path.addLine(to: CGPoint(x: 0, y: 92.5724))
                    path.closeSubpath()
                }
                .fill(.white)

                // Bottom right stack
                Path { path in
                    path.move(to: CGPoint(x: 90.912, y: 66.7449))
                    path.addLine(to: CGPoint(x: 69.2676, y: 79.2411))
                    path.addLine(to: CGPoint(x: 69.2676, y: 104.235))
                    path.addLine(to: CGPoint(x: 90.912, y: 91.7392))
                    path.closeSubpath()
                }
                .fill(.white)

                // Top right stack
                Path { path in
                    path.move(to: CGPoint(x: 114, y: 53.4143))
                    path.addLine(to: CGPoint(x: 92.3555, y: 65.912))
                    path.addLine(to: CGPoint(x: 92.3555, y: 90.9063))
                    path.addLine(to: CGPoint(x: 114, y: 78.4086))
                    path.closeSubpath()
                }
                .fill(.white)

                // Center stack
                Path { path in
                    path.move(to: CGPoint(x: 23, y: 79.2533))
                    path.addLine(to: CGPoint(x: 44.6444, y: 66.7556))
                    path.addLine(to: CGPoint(x: 66.29, y: 79.2533))
                    path.addLine(to: CGPoint(x: 44.6444, y: 91.7495))
                    path.closeSubpath()
                }
                .fill(.white)

                // Center bottom stack
                Path { path in
                    path.move(to: CGPoint(x: 23, y: 80.9199))
                    path.addLine(to: CGPoint(x: 44.6444, y: 93.4162))
                    path.addLine(to: CGPoint(x: 44.6444, y: 118.41))
                    path.addLine(to: CGPoint(x: 23, y: 105.914))
                    path.closeSubpath()
                }
                .fill(.white)

                // Right bottom stack
                Path { path in
                    path.move(to: CGPoint(x: 67.7325, y: 80.0867))
                    path.addLine(to: CGPoint(x: 46.0881, y: 92.5829))
                    path.addLine(to: CGPoint(x: 46.0881, y: 117.577))
                    path.addLine(to: CGPoint(x: 67.7325, y: 105.081))
                    path.closeSubpath()
                }
                .fill(.white)
            }

            // Foreground shapes (colored)
            Group {
                // Top center stack
                Path { path in
                    path.move(to: CGPoint(x: 23.0903, y: 25.8254))
                    path.addLine(to: CGPoint(x: 44.7347, y: 13.3291))
                    path.addLine(to: CGPoint(x: 66.3804, y: 25.8254))
                    path.addLine(to: CGPoint(x: 44.7347, y: 38.323))
                    path.closeSubpath()
                }
                .fill(color)

                // Top left stack
                Path { path in
                    path.move(to: CGPoint(x: 0.0012207, y: 39.1559))
                    path.addLine(to: CGPoint(x: 21.6456, y: 26.6582))
                    path.addLine(to: CGPoint(x: 43.2913, y: 39.1559))
                    path.addLine(to: CGPoint(x: 21.6456, y: 51.6521))
                    path.closeSubpath()
                }
                .fill(color)

                // Top right stack
                Path { path in
                    path.move(to: CGPoint(x: 46.1794, y: 39.1559))
                    path.addLine(to: CGPoint(x: 67.8238, y: 26.6582))
                    path.addLine(to: CGPoint(x: 89.4695, y: 39.1559))
                    path.addLine(to: CGPoint(x: 67.8238, y: 51.6521))
                    path.closeSubpath()
                }
                .fill(color)

                // Topmost stack
                Path { path in
                    path.move(to: CGPoint(x: 46.1794, y: 12.4963))
                    path.addLine(to: CGPoint(x: 67.8238, y: 0))
                    path.addLine(to: CGPoint(x: 89.4695, y: 12.4963))
                    path.addLine(to: CGPoint(x: 67.8238, y: 24.9939))
                    path.closeSubpath()
                }
                .fill(color)

                // Right top stack
                Path { path in
                    path.move(to: CGPoint(x: 69.2676, y: 25.8254))
                    path.addLine(to: CGPoint(x: 90.912, y: 13.3291))
                    path.addLine(to: CGPoint(x: 112.558, y: 25.8254))
                    path.addLine(to: CGPoint(x: 90.912, y: 38.323))
                    path.closeSubpath()
                }
                .fill(color)

                // Left middle stack
                Path { path in
                    path.move(to: CGPoint(x: 0.0012207, y: 40.8225))
                    path.addLine(to: CGPoint(x: 21.6456, y: 53.3188))
                    path.addLine(to: CGPoint(x: 21.6456, y: 78.3131))
                    path.addLine(to: CGPoint(x: 0, y: 65.8168))
                    path.closeSubpath()
                }
                .fill(color)

                // Center middle stack
                Path { path in
                    path.move(to: CGPoint(x: 46.1794, y: 40.8225))
                    path.addLine(to: CGPoint(x: 67.8238, y: 53.3188))
                    path.addLine(to: CGPoint(x: 67.8238, y: 78.3131))
                    path.addLine(to: CGPoint(x: 46.1794, y: 65.8168))
                    path.closeSubpath()
                }
                .fill(color)

                // Right middle stack
                Path { path in
                    path.move(to: CGPoint(x: 90.912, y: 39.9893))
                    path.addLine(to: CGPoint(x: 69.2676, y: 52.4855))
                    path.addLine(to: CGPoint(x: 69.2676, y: 77.4798))
                    path.addLine(to: CGPoint(x: 90.912, y: 64.9836))
                    path.closeSubpath()
                }
                .fill(color)

                // Left side stack
                Path { path in
                    path.move(to: CGPoint(x: 44.7347, y: 39.9893))
                    path.addLine(to: CGPoint(x: 23.0903, y: 52.4855))
                    path.addLine(to: CGPoint(x: 23.0903, y: 77.4798))
                    path.addLine(to: CGPoint(x: 44.7347, y: 64.9836))
                    path.closeSubpath()
                }
                .fill(color)

                // Top rightmost stack
                Path { path in
                    path.move(to: CGPoint(x: 114, y: 26.6587))
                    path.addLine(to: CGPoint(x: 92.3555, y: 39.1564))
                    path.addLine(to: CGPoint(x: 92.3555, y: 64.1507))
                    path.addLine(to: CGPoint(x: 114, y: 51.653))
                    path.closeSubpath()
                }
                .fill(color)
            }
        }
        .frame(width: size, height: size * (119.0 / 114.0))
        .clipped()
    }
}

#Preview {
    VStack(spacing: 20) {
        PileLogoView(size: 60, color: .blue)
        PileLogoView(size: 40, color: .green)
        PileLogoView(size: 20, color: .red)
    }
    .padding()
}
